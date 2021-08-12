import { classToPlain } from 'class-transformer';

import {
  api,
  fetchAndParseDocument,
  getRawListData,
  IReadingListItem,
  logger as defaultLogger,
  ReadingListItem,
  setRawListData,
} from '@/common';

import './sync';

const logger = defaultLogger.child('BG/list');

export class BackgroundReadingListItem extends ReadingListItem {
  static async fetch(workId: number): Promise<BackgroundReadingListItem> {
    const doc = await fetchAndParseDocument(
      `https://archiveofourown.org/works/${workId}`
    );
    const blurb = doc.querySelector('.work.blurb');
    if (blurb) {
      return BackgroundReadingListItem.fromListingBlurb(
        workId,
        blurb as HTMLElement
      );
    }
    return BackgroundReadingListItem.fromWorkPage(workId, doc);
  }
}

let listData: Record<number, BackgroundReadingListItem> = {};
let portIndex = 0;
const ports: Array<browser.runtime.Port> = [];

interface Change {
  workId: number;
  item: IReadingListItem | null;
}

export async function fetchListData(): Promise<void> {
  listData = await getRawListData(BackgroundReadingListItem);
  await propagateChanges(
    Object.entries(listData).map(([workId, item]) => ({
      workId: parseInt(workId),
      item: classToPlain(item) as IReadingListItem,
    }))
  );
}
fetchListData().catch((e) => console.error(e));

export async function propagateChanges(
  changes: Change[],
  sender?: browser.runtime.MessageSender
): Promise<void> {
  for (const port of Object.values(ports)) {
    if (
      sender &&
      port.sender &&
      sender.frameId === port.sender.frameId &&
      sender.tab &&
      port.sender.tab &&
      sender.tab.id === port.sender.tab.id &&
      sender.tab.windowId === port.sender.tab.windowId
    ) {
      continue;
    }
    port.postMessage({
      changes,
    });
  }
}

export async function setListData(
  workId: number,
  item: ReadingListItem | null,
  sender?: browser.runtime.MessageSender
): Promise<void> {
  logger.log('setListData', workId, item);
  if (item === null) {
    delete listData[workId];
  } else {
    listData[workId] = item;
  }
  await setRawListData(listData);
  await propagateChanges(
    [
      {
        workId: workId,
        item: item !== null ? (classToPlain(item) as IReadingListItem) : null,
      },
    ],
    sender
  );
}

api.readingListFetch.addListener(async () => {
  return Object.fromEntries(
    Object.entries(listData).map(([rawWorkId, rawItem]) => {
      const workId = parseInt(rawWorkId);
      const item = classToPlain(rawItem);
      return [workId, item];
    })
  );
});

api.readingListSet.addListener(async ({ workId, item }, sender) => {
  await setListData(workId, item, sender);
});

browser.runtime.onConnect.addListener((port) => {
  const index = portIndex++;
  ports[index] = port;
  port.onDisconnect.addListener(() => {
    delete ports[index];
  });
});

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = browser.runtime.getURL('reading_list.html');
    const paths = new URL(details.url).pathname.split('/');
    if (paths.length >= 3) {
      const workId = paths[2];
      return { redirectUrl: `${url}?show=${workId}` };
    }
    return { redirectUrl: url };
  },
  { urls: ['*://*.archiveofourown.org/ao3e-reading-list*'] },
  ['blocking']
);

// browser.webRequest.onBeforeRequest.addListener(
//   async (details) => {
//     const url = new URL(details.url);
//     const paths = url.pathname.split('/');
//     const workId = parseInt(paths[2]);
//     const chapterIndex = parseInt(paths[4]) - 1;
//     const readingList = await getListData(BackgroundReadingListItem);
//     const item =
//       readingList.find((item) => item.workId === workId) ||
//       (await BackgroundReadingListItem.fetch(workId));

//     // TODO: Update .chapters
//     // TODO: Save item to cache?

//     return {
//       redirectUrl:
//         `https://archiveofourown.org/works/${workId}` +
//         (item.chapters.length === 0 && item.chapters[0].chapterId === null
//           ? ''
//           : `/chapters/${item.chapters[chapterIndex].chapterId}`),
//     };
//   },
//   { urls: ['https://archiveofourown.org/works/*/ao3e-chapter/*'] },
//   ['blocking']
// );
