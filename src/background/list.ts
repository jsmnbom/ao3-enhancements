import PQueue from 'p-queue';

import {
  api,
  Chapter,
  fetchAndParseDocument,
  getListData,
  getOptions,
  logger as defaultLogger,
  ReadingListItem,
} from '@/common';

const logger = defaultLogger.child('BG/list');

const statusToTagMap = {
  read: 'Read',
  toRead: 'To Read',
  dropped: 'Dropped',
  reading: 'Reading',
  unread: 'Unread',
  onHold: 'On Hold',
};

const statusTags = Array.from(Object.values(statusToTagMap));

const ao3Queue = new PQueue({
  // Assuming the production ao3 site uses configuration defaults
  // it allows 300 requests within 300 seconds. We want to be as gentle
  // as possible, so allow at most requests in that period from the background script.
  // This allows the user's normal requests to hopefully still work properly.
  // TODO: Investigate exactly which requests contribute to the rate limiting
  // and maybe implment a tracker for normal requests by the user. Might be hard
  // since the rate limiting is per IP, tho.
  // https://github.com/otwcode/otwarchive/blob/63ed5aa8387b7593831811e66a2f2c2654bdea15/config/config.yml#L167
  interval: 300,
  intervalCap: 60,
});

async function bookmarkData(
  data: URLSearchParams,
  item: ReadingListItem
): Promise<URLSearchParams> {
  const options = await getOptions([
    'readingListCollectionId',
    'readingListPsued',
  ]);
  const { readingListCollectionId, readingListPsued } = options;
  if (!readingListCollectionId || !readingListPsued) {
    throw new Error(
      "Can't update bookmark: Missing collection and pseud id option."
    );
  }

  // Tags
  let tags = (data.get('bookmark[tag_string]') as string).split(',');
  const tagToAdd = statusToTagMap[item.status];
  tags = tags.filter(
    (tag) => tag === tagToAdd || (!statusTags.includes(tag) && tag !== '')
  );
  if (!tags.includes(tagToAdd)) {
    tags.push(tagToAdd);
  }
  data.set('bookmark[tag_string]', tags.join(','));

  // Notes
  let notes = data.get('bookmark[bookmarker_notes]') as string;
  const link = `<a href="${item.linkURL}">Show in AO3 Enhancements Reading List</a>`;
  const re = /<a href="\/ao3e-reading-list\/\d+\?.*">.*<\/a>/;
  if (re.exec(notes)) {
    notes = notes.replace(re, link);
  } else {
    notes += link;
  }
  data.set('bookmark[bookmarker_notes]', notes);

  // Collection id
  let collections = (data.get('bookmark[collection_names]') as string).split(
    ','
  );
  if (collections.length === 1 && collections[0] === '') collections = [];
  if (!collections.includes(readingListCollectionId)) {
    collections.push(readingListCollectionId);
  }
  data.set('bookmark[collection_names]', collections.join(','));

  // Private
  // const private_arr = data.getAll('bookmark[private]') as string[];
  // TODO: replace
  data.set('bookmark[private]', '1');

  // Pseud id
  const pseudId = readingListPsued.id;
  data.set('bookmark[pseud_id]', pseudId.toString());

  return data;
}

async function updateOrCreateBookmark(
  rawData: URLSearchParams,
  item: ReadingListItem,
  formAction: string
): Promise<void> {
  const data = await bookmarkData(rawData, item);

  // const params = new URLSearchParams(data as unknown as string[][]);

  console.log(item, Array.from(data.entries()), data.toString(), formAction);

  // const res = await ao3Queue.add(() =>
  //   fetch(formAction, {
  //     method: 'post',
  //     body: params,
  //   })
  // );
  // console.log(res);
}

browser.runtime.onMessage.addListener((msg: api.Message) => {
  if (msg.processBookmark) {
    const { data, item, formAction } = api.receive.processBookmark(
      msg.processBookmark
    );
    updateOrCreateBookmark(data, item, formAction).catch((e) =>
      console.error(e)
    );
  }
});

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

browser.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const url = new URL(details.url);
    const paths = url.pathname.split('/');
    const workId = parseInt(paths[2]);
    const chapterIndex = parseInt(paths[4]) - 1;
    const readingList = await getListData(BackgroundReadingListItem);
    const item =
      readingList.find((item) => item.workId === workId) ||
      (await BackgroundReadingListItem.fetch(workId));

    // TODO: Update .chapters
    // TODO: Save item to cache?

    return {
      redirectUrl:
        `https://archiveofourown.org/works/${workId}` +
        (item.chapters.length === 0 && item.chapters[0].chapterId === null
          ? ''
          : `/chapters/${item.chapters[chapterIndex].chapterId}`),
    };
  },
  { urls: ['https://archiveofourown.org/works/*/ao3e-chapter/*'] },
  ['blocking']
);

class BackgroundReadingListItem extends ReadingListItem {
  static async fetch(workId: number): Promise<BackgroundReadingListItem> {
    const doc = await fetchAndParseDocument(
      `https://archiveofourown.org/works/${workId}`
    );

    // TODO: Support works with 1 chapter
    // TODO: Send view_adult	"true" cookie
    // TODO: Use queue

    const chapterSelect: HTMLSelectElement | null = doc.querySelector(
      '#chapter_index select'
    );
    const chapters = chapterSelect
      ? Array.from(chapterSelect.options).map(
          (option) => new Chapter(parseInt(option.value))
        )
      : [new Chapter(null)];
    const [_written, total] = doc
      .querySelector('#main .work.meta.group .stats .chapters')!
      .textContent!.split('/');
    return new BackgroundReadingListItem(
      workId,
      doc.querySelector('#workskin .title')!.textContent!.trim(),
      doc.querySelector('#workskin .byline')!.textContent!.trim(),
      'unread',
      // TODO: Somehow update chapters?
      chapters,
      total === '?' ? null : parseInt(total)
    );
  }
}
