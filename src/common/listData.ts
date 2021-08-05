import {
  classToPlain,
  Exclude,
  plainToClass,
  Transform,
  Type,
} from 'class-transformer';
import dayjs, { Dayjs } from 'dayjs';
import LZString from 'lz-string';

import { api } from './api';

export const STATUSES: ReadingStatus[] = [
  'reading',
  'toRead',
  'onHold',
  'read',
  'dropped',
];

export function statusText(status: ReadingStatus): string {
  switch (status) {
    case 'dropped':
      return 'dropped';
    case 'toRead':
      return 'plan to read';
    case 'read':
      return 'fully read';
    case 'reading':
      return 'currently reading';
    case 'unread':
      return 'never read';
    case 'onHold':
      return 'on hold';
  }
}

export function upperStatusText(status: ReadingStatus): string {
  const s = statusText(status);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export class ReadingListItem {
  @Type(() => Chapter)
  @Transform(
    ({ value: chapters, obj: item }) => {
      return (chapters as Chapter[]).map((chapter, index) => {
        chapter.workId = (item as ReadingListItem).workId;
        chapter.index = index;
        return chapter;
      });
    },
    { toClassOnly: true }
  )
  chapters: Chapter[];
  @Exclude({ toPlainOnly: true })
  workId: number;
  title: string;
  author: string;
  totalChapters: number | null;
  status: ReadingStatus;
  bookmarkId?: number;
  rating: number;

  constructor(
    workId: number,
    title: string,
    author: string,
    status: ReadingStatus,
    chapters: Chapter[],
    totalChapters: number | null
  ) {
    this.workId = workId;
    this.title = title;
    this.author = author;
    this.status = status;
    this.chapters = chapters;
    this.totalChapters = totalChapters;
    this.rating = 0;
  }

  public static fromPlain(workId: number, data: unknown): ReadingListItem {
    (data as ReadingListItem).workId = workId;
    return plainToClass(this, data) as unknown as ReadingListItem;
  }

  public get statusText(): string {
    return statusText(this.status);
  }

  public get upperStatusText(): string {
    return upperStatusText(this.status);
  }

  public get isAnyChaptersRead(): boolean {
    return this.chapters.some((chapter) => !!chapter.readDate);
  }

  public get isAllChaptersRead(): boolean {
    return this.chapters.every((chapter) => !!chapter.readDate);
  }

  public get isWorkWIP(): boolean {
    return this.chapters.length !== this.totalChapters;
  }

  public get chaptersReadCount(): number {
    return this.chapters.filter((chapter) => chapter.readDate).length;
  }

  public get lastReadChapterIndex(): number | undefined {
    const x = this.chapters
      .slice()
      .reverse()
      .findIndex((chapter) => chapter.readDate);
    if (x === -1) {
      return undefined;
    }
    return -1 + this.chapters.length - x!;
  }

  public get firstUnreadChapterIndex(): number | undefined {
    const x = this.chapters.findIndex((chapter) => !chapter.readDate);
    if (x === -1) {
      return undefined;
    }
    return x;
  }

  public async save(): Promise<void> {
    await api.readingListSet.sendBG(this.workId, this);

    // TODO: update bookmark (be careful of infinite loop if create bookmark calls this)
    // Though i suppose not infinite but still gets called unnecessarily
    // Maybe add a updateBookmark: boolean parameter
  }

  public get dataURL(): string {
    const data = {
      status: this.status,
      chapters: LZString.compressToEncodedURIComponent(
        this.chapters
          .map((chapter) =>
            chapter.readDate ? chapter.readDate.valueOf() : ''
          )
          .join(',')
      ),
    };
    const params = new URLSearchParams(data);
    return `https://archiveofourown.org/ao3e-reading-list/${
      this.workId
    }?${params.toString()}`;
  }

  public get linkURL(): string {
    return `https://archiveofourown.org/ao3e-reading-list/${this.workId}`;
  }

  public get bookmarkHref(): string | undefined {
    if (!this.bookmarkId) return undefined;
    return `https://archiveofourown.org/bookmarks/${this.bookmarkId}`;
  }

  public get isInList(): boolean {
    return this.isAnyChaptersRead || this.status !== 'unread';
  }

  public async update(data: ReadingListItem, full = false): Promise<void> {
    let change = false;
    const simple: Array<
      'workId' | 'title' | 'author' | 'totalChapters' | 'rating' | 'status'
    > = ['workId', 'title', 'author', 'totalChapters', 'rating'];
    if (full) simple.push('status');
    for (const key of simple) {
      if (this[key] !== data[key]) {
        change = true;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this[key] = data[key];
      }
    }
    if (this.chapters.length !== data.chapters.length) {
      change = true;
    }
    for (
      let i = 0;
      i < Math.max(this.chapters.length, data.chapters.length);
      i++
    ) {
      // TODO: What happens when a chapter is updated? Does its chapterId change?
      // figure that out and update code so if e.g. chapterid=3 is read, then it will keep being read, even if prev chapter is deleted
      if (this.chapters[i] && data.chapters[i]) {
        const ts = this.chapters[i];
        const ds = data.chapters[i];
        if (ds.chapterId !== undefined && ts.chapterId !== ds.chapterId) {
          change = true;
          ts.chapterId = ds.chapterId;
        }
      } else if (this.chapters[i] && !data.chapters[i]) {
        delete this.chapters[i];
      } else if (!this.chapters[i] && data.chapters[i]) {
        this.chapters[i] = data.chapters[i];
      }
    }

    if (change) {
      await this.save();
    }
  }
}

export class Chapter {
  @Transform(({ value }) => dayjs(value), { toClassOnly: true })
  @Transform(({ value }: { value: Dayjs }) => value.valueOf(), {
    toPlainOnly: true,
  })
  readDate?: Dayjs | undefined;
  @Exclude()
  workId: number;
  @Exclude()
  index: number;
  chapterId?: number;

  constructor(index: number, workId: number, chapterId?: number) {
    this.index = index;
    this.workId = workId;
    this.chapterId = chapterId;
  }

  get readText(): string | undefined {
    return this.readDate?.format('YYYY-MM-DD');
  }

  public getHref(absolute = false, workskin = false): string {
    const base = absolute ? 'https://archiveofourown.org' : '';
    const chapter =
      this.chapterId === undefined
        ? this.index === 0
          ? ''
          : `/ao3e-chapter/${this.index}`
        : `/chapters/${this.chapterId}`;
    const fragment = workskin ? '#workskin' : '';
    return `${base}/works/${this.workId}${chapter}${fragment}`;
  }
}

export type ReadingStatus =
  | 'reading'
  | 'read'
  | 'toRead'
  | 'dropped'
  | 'unread'
  | 'onHold';

const STORAGE_KEY = 'readingList.list';
export class ReadingListData<
  T extends typeof ReadingListItem,
  I = InstanceType<T>,
  C extends (workId: number, item: I | null) => void = (
    workId: number,
    item: I | null
  ) => void
> {
  callbacks: [number | number[] | null, C][] = [];
  constructor(private type: T) {
    const port = browser.runtime.connect();
    port.onMessage.addListener((rawData) => {
      console.log(rawData, this.callbacks);
      const data = rawData as unknown as { changes: [Record<string, unknown>] };
      for (const change of data.changes) {
        const workId = change.workId as number;
        const item = change.item as unknown;
        for (const callback of this.callbacks) {
          if (
            callback[0] === null ||
            callback[0] === workId ||
            (typeof callback[0] === 'object' && callback[0].includes(workId))
          ) {
            callback[1](
              workId,
              item !== null
                ? (this.type.fromPlain(workId, item) as unknown as I)
                : null
            );
          }
        }
      }
    });
  }

  async get(): Promise<Record<number, I>> {
    return Object.fromEntries(
      Object.entries(await api.readingListFetch.sendBG()).map(
        ([rawWorkId, rawItem]) => {
          const workId = parseInt(rawWorkId);
          const item = this.type.fromPlain(workId, rawItem) as unknown as I;
          return [workId, item];
        }
      )
    ) as unknown as Record<number, I>;
  }

  // async set(workId: number, item: ReadingListItem): Promise<void> {
  //   return await api.readingListSet.sendBG(workId, item);
  // }

  addListener(callback: C, workIds: number | number[] | null): void {
    console.log(callback, workIds);
    this.callbacks.push([workIds, callback]);
  }
}

export async function getRawListData<
  T extends typeof ReadingListItem,
  I extends InstanceType<T>
>(type: T): Promise<Record<number, I>> {
  const data = await browser.storage.local.get({
    [STORAGE_KEY]: '{}',
  });
  const x = JSON.parse(data[STORAGE_KEY]) as Record<number, unknown>;
  console.log(JSON.stringify(x));
  const readingList = Object.fromEntries(
    Object.entries(x).map(([rawWorkId, rawItem]) => {
      const workId = parseInt(rawWorkId);
      const item = type.fromPlain(workId, rawItem) as unknown as I;
      return [workId, item];
    })
  );
  console.log(readingList);
  return readingList;
}

export async function setRawListData<
  T extends typeof ReadingListItem,
  I extends InstanceType<T>
>(data: Record<number, I>): Promise<void> {
  await browser.storage.local.set({
    [STORAGE_KEY]: JSON.stringify(
      Object.fromEntries(
        Object.entries(data).map(([workId, item]) => [
          workId,
          classToPlain(item),
        ])
      )
    ),
  });
}
