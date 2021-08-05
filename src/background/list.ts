// import PQueue from 'p-queue';
import { classToPlain } from 'class-transformer';

import {
  api,
  // Chapter,
  getRawListData,
  // getOptions,
  logger as defaultLogger,
  ReadingListItem,
  setRawListData,
} from '@/common';

const logger = defaultLogger.child('BG/list');

class BackgroundReadingListItem extends ReadingListItem {
  // static async fetch(workId: number): Promise<BackgroundReadingListItem> {
  //   const doc = await ao3FetchDocument(
  //     `https://archiveofourown.org/works/${workId}`
  //   );
  //   // TODO: Support works with 1 chapter
  //   // TODO: Send view_adult	"true" cookie
  //   const chapterSelect: HTMLSelectElement | null = doc.querySelector(
  //     '#chapter_index select'
  //   );
  //   const chapters = chapterSelect
  //     ? Array.from(chapterSelect.options).map(
  //         (option) => new Chapter(parseInt(option.value))
  //       )
  //     : [new Chapter()];
  //   const [_written, total] = doc
  //     .querySelector('#main .work.meta.group .stats .chapters')!
  //     .textContent!.split('/');
  //   return new BackgroundReadingListItem(
  //     workId,
  //     doc.querySelector('#workskin .title')!.textContent!.trim(),
  //     doc.querySelector('#workskin .byline')!.textContent!.trim(),
  //     'unread',
  //     // TODO: Somehow update chapters?
  //     chapters,
  //     total === '?' ? null : parseInt(total)
  //   );
  // }
}

let listData: Record<number, BackgroundReadingListItem> = {};
let portIndex = 0;
const ports: Array<browser.runtime.Port> = [];

(async () => {
  listData = await getRawListData(BackgroundReadingListItem);
  for (const port of Object.values(ports)) {
    port.postMessage({
      changes: Object.entries(listData).map(([workId, item]) => ({
        workId: parseInt(workId),
        item: classToPlain(item),
      })),
    });
  }
})().catch((e) => console.error(e));

async function setListData(
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
      changes: [
        { workId: workId, item: item !== null ? classToPlain(item) : null },
      ],
    });
  }
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

// const statusToTagMap = {
//   read: 'Read',
//   toRead: 'To Read',
//   dropped: 'Dropped',
//   reading: 'Reading',
//   unread: 'Unread',
//   onHold: 'On Hold',
// };

// const statusTags = Array.from(Object.values(statusToTagMap));

// const ao3Queue = new PQueue({
//   concurrency: 1,
//   // Assuming the production ao3 site uses configuration defaults from
//   // https://github.com/otwcode/otwarchive/blob/63ed5aa8387b7593831811e66a2f2c2654bdea15/config/config.yml#L167
//   // it allows 300 requests within 5 min. We want to be as gentle
//   // as possible, so allow at most requests in that period from the background script.
//   // This allows the user's normal requests to hopefully still work properly.
//   // TODO: Investigate exactly which requests contribute to the rate limiting
//   // and maybe implment a tracker for normal requests by the user. Might be hard
//   // since the rate limiting is per IP, tho.
//   // interval: 5 * 60 * 1000,
//   // intervalCap: 60,
//   // However it makes a little more sense to spread the requests out a bit
//   // This might make it feel slower, but it will prevent cases where "nothing" happens for almost 5 min
//   interval: (5 * 60 * 1000) / 6,
//   intervalCap: 10,
// });

// async function ao3Fetch(
//   ...args: Parameters<typeof window.fetch>
// ): ReturnType<typeof window.fetch> {
//   const res = await ao3Queue.add(() => fetch(...args));
//   if (res.status !== 200) {
//     throw new Error('Status was not 200 OK');
//   }
//   return res;
// }

// async function ao3FetchDocument(
//   ...args: Parameters<typeof window.fetch>
// ): Promise<Document> {
//   const response = await ao3Fetch(...args);
//   const text = await response.text();
//   const parser = new DOMParser();
//   return parser.parseFromString(text, 'text/html');
// }

// async function ao3FetchJSON(
//   ...args: Parameters<typeof window.fetch>
// ): Promise<unknown> {
//   const response = await ao3Fetch(...args);
//   return (await response.json()) as unknown;
// }

// async function bookmarkData(
//   item: ReadingListItem,
//   data: URLSearchParams
// ): Promise<URLSearchParams> {
//   const options = await getOptions([
//     'readingListCollectionId',
//     'readingListPsued',
//   ]);
//   const { readingListCollectionId, readingListPsued } = options;
//   if (!readingListCollectionId || !readingListPsued) {
//     throw new Error(
//       "Can't update bookmark: Missing collection and pseud id option."
//     );
//   }

//   // Tags
//   let tags = (data.get('bookmark[tag_string]') || '').split(',');
//   const tagToAdd = statusToTagMap[item.status];
//   tags = tags.filter(
//     (tag) => tag === tagToAdd || (!statusTags.includes(tag) && tag !== '')
//   );
//   if (!tags.includes(tagToAdd)) {
//     tags.push(tagToAdd);
//   }
//   data.set('bookmark[tag_string]', tags.join(','));

//   // Notes
//   let notes = data.get('bookmark[bookmarker_notes]') || '';
//   const link = `<a href="${item.dataURL}">Show in AO3 Enhancements Reading List</a>`;
//   const re = /<a href="\/ao3e-reading-list\/\d+\?.*">.*<\/a>/;
//   if (re.exec(notes)) {
//     notes = notes.replace(re, link);
//   } else {
//     notes += link;
//   }
//   data.set('bookmark[bookmarker_notes]', notes);

//   // Collection id
//   let collections = (data.get('bookmark[collection_names]') || '').split(',');
//   if (collections.length === 1 && collections[0] === '') collections = [];
//   if (!collections.includes(readingListCollectionId)) {
//     collections.push(readingListCollectionId);
//   }
//   data.set('bookmark[collection_names]', collections.join(','));

//   // Private
//   // const private_arr = data.getAll('bookmark[private]') as string[];
//   // TODO: replace
//   data.set('bookmark[private]', '1');

//   // Rec
//   data.set('bookmark[rec]', data.get('bookmark[rec]') || '0');

//   // Pseud id
//   const pseudId = readingListPsued.id;
//   data.set('bookmark[pseud_id]', pseudId.toString());

//   return data;
// }

// async function updateBookmark(
//   // TODO: Figure out a RequireKey type, so bookmarkId is required
//   item: ReadingListItem
// ): Promise<void> {
//   const editDoc = await ao3FetchDocument(
//     `https://archiveofourown.org/bookmarks/${item.bookmarkId}/edit`
//   );
//   // TODO: If bookmarked created at date is not today, then delete + recreate bookmark
//   const bookmarkForm = editDoc.querySelector(
//     '#bookmark-form form'
//   ) as HTMLFormElement | null;
//   if (bookmarkForm === null) throw new Error('Mising bookmark form.');
//   const oldData = new URLSearchParams(
//     new FormData(bookmarkForm) as unknown as string[][]
//   );
//   console.log(Array.from(oldData.entries()), oldData.toString());
//   const newData = await bookmarkData(item, oldData);

//   console.log(Array.from(newData.entries()), newData.toString());

//   const res = await ao3Queue.add(() =>
//     fetch(`https://archiveofourown.org/bookmarks/${item.bookmarkId}`, {
//       method: 'post',
//       body: newData,
//     })
//   );
//   console.log(res);
// }

// async function createBookmark(item: ReadingListItem): Promise<void> {
//   const token = (
//     (await ao3FetchJSON(
//       'https://archiveofourown.org/token_dispenser.json'
//     )) as { token: string }
//   ).token;
//   const q = new URLSearchParams([
//     ['authenticity_token', token],
//     ['commit', 'Create'],
//     ['utf8', '✓'],
//   ]);
//   const data = await bookmarkData(item, q);
//   const res = await ao3Fetch(
//     `https://archiveofourown.org/works/${item.workId}/bookmarks`,
//     { method: 'post', body: data }
//   );
//   const resPaths = new URL(res.url).pathname.split('/');
//   if (resPaths.length !== 3 || resPaths[1] !== 'bookmarks') {
//     throw new Error(
//       'Create bookmark did not redirect like we thought it would.'
//     );
//   }
//   const bookmarkId = parseInt(resPaths[2]);
//   item.bookmarkId = bookmarkId;
//   // TODO: Somehow propagate this value out, so we don't try and create another bookmark
//   // We could return it and let client code handle it instead?
//   // That would fix in most simple cases.
//   await item.save();
// }

// api.processBookmark.addListener(async ({ item }) => {
//   if (item.bookmarkId === undefined) {
//     await createBookmark(item);
//   } else {
//     await updateBookmark(item);
//   }
// });

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    const workId = new URL(details.url).pathname.split('/')[2];
    return {
      redirectUrl: `${browser.runtime.getURL(
        'reading_list.html'
      )}?show=${workId}`,
    };
  },
  { urls: ['https://archiveofourown.org/ao3e-reading-list/*'] },
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
