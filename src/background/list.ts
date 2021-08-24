import { classToPlain } from 'class-transformer';

import {
  PlainWork,
  BaseWork,
  WorkMap,
  BaseDataWrapper,
  getStoragePlain,
  setStoragePlain,
  WorkChange,
  workMapPlainStringify,
} from '@/common/readingListData';
import { fetchAndParseDocument } from '@/common/utils';
import { api } from '@/common/api';
import { createLogger } from '@/common/logger';

export class BackgroundWork extends BaseWork {
  static async fetch(workId: number): Promise<BackgroundWork> {
    const doc = await fetchAndParseDocument(
      `https://archiveofourown.org/works/${workId}`
    );
    const blurb = doc.querySelector('li.work.blurb');
    if (blurb) {
      return BackgroundWork.fromListingBlurb(workId, blurb);
    }
    return BackgroundWork.fromWorkPage(workId, doc);
  }
}

class BackgroundDataWrapper extends BaseDataWrapper<typeof BackgroundWork> {
  data: WorkMap<BackgroundWork> = new Map();
  ports: Set<browser.runtime.Port> = new Set();
  logger = createLogger('BackgroundDataWrapper');

  constructor() {
    super(BackgroundWork);

    api.readingListFetch.addListener(async () => {
      return workMapPlainStringify(this.toPlain(this.data));
    });

    api.readingListSet.addListener(async ({ workId, item }, sender) => {
      await this.setData(workId, item, sender);
    });

    browser.runtime.onConnect.addListener((port) => {
      this.ports.add(port);
      port.onDisconnect.addListener(() => {
        this.ports.delete(port);
      });
    });
  }

  async init(): Promise<void> {
    const plainMap = await getStoragePlain();
    this.data = this.fromPlain(BackgroundWork, plainMap);
    this.logger.log(this.data);
    await this.propagateChanges(
      Array.from(plainMap).map(([workId, plain]) => ({
        workId,
        work: plain,
      }))
    );
  }

  async setData(
    workId: number,
    work: BaseWork | null,
    sender?: browser.runtime.MessageSender
  ): Promise<void> {
    if (work === null) {
      this.data.delete(workId);
    } else {
      this.data.set(workId, work);
    }
    const plainMap = this.toPlain(this.data);
    await setStoragePlain(plainMap);
    await this.propagateChanges(
      [
        {
          workId: workId,
          work: work !== null ? (classToPlain(work) as PlainWork) : null,
        },
      ],
      sender
    );
  }

  async propagateChanges(
    changes: WorkChange[],
    sender?: browser.runtime.MessageSender
  ): Promise<void> {
    for (const port of this.ports) {
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
}

export const backgroundData = new BackgroundDataWrapper();
backgroundData.init().catch((e) => console.error(e));

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

browser.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const url = new URL(details.url);
    const paths = url.pathname.split('/');
    const workId = parseInt(paths[2]);
    const chapterIndex = parseInt(paths[4]) - 1;

    const workMap = backgroundData.data;
    const work = workMap.get(workId);
    if (work === undefined) {
      return { redirectUrl: `https://archiveofourown.org/works/${workId}` };
    }
    if (work.chapters.length > chapterIndex) {
      return { redirectUrl: work.chapters[chapterIndex].getHref(true) };
    }
    const update = await BackgroundWork.fetch(workId);
    if (work.update(update)) {
      await backgroundData.setData(workId, work);
    }
    return {
      redirectUrl:
        work.chapters[chapterIndex]?.getHref(true) ||
        work.chapters[0].getHref(true),
    };
  },
  { urls: ['*://*.archiveofourown.org/works/*/ao3e-chapters/*'] },
  ['blocking']
);
