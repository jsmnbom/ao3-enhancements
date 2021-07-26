import {
  classToPlain,
  Exclude,
  plainToClass,
  Transform,
  Type,
} from 'class-transformer';
import dayjs, { Dayjs } from 'dayjs';
import LZString from 'lz-string';

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
    ({ value: chapters, key: _, obj: item }) => {
      return (chapters as Chapter[]).map((chapter, index) => {
        chapter.workId = (item as ReadingListItem).workId;
        chapter.index = index;
        return chapter;
      });
    },
    { toClassOnly: true }
  )
  chapters!: Chapter[];
  title!: string;
  author!: string;
  totalChapters!: number | null;
  status!: ReadingStatus;
  workId!: number;
  bookmarkId?: number;
  rating!: number;

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
    const readingList = await getListData(ReadingListItem);
    const index = readingList.findIndex((item) => item.workId === this.workId);
    if (index === -1) {
      readingList.push(this);
    } else {
      readingList[index] = this;
    }
    await setListData(readingList);

    // TODO: update bookmark
  }

  public get linkURL(): string {
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
    return `/ao3e-reading-list/${this.workId}?${params.toString()}`;
  }

  public get bookmarkHref(): string | undefined {
    if (!this.bookmarkId) return undefined;
    return `https://archiveofourown.org/bookmark/${this.bookmarkId}`;
  }
}

export class Chapter {
  @Transform(({ value }) => dayjs(value), { toClassOnly: true })
  @Transform(({ value }: { value: Dayjs }) => value.valueOf(), {
    toPlainOnly: true,
  })
  readDate?: Dayjs | undefined;
  @Exclude()
  workId!: number;
  @Exclude()
  index!: number;
  chapterId!: number | null;

  constructor(chapterId: number | null) {
    this.chapterId = chapterId;
  }

  get readText(): string | undefined {
    return this.readDate?.format('YYYY-MM-DD');
  }

  public getHref(absolute = false, workskin = false): string {
    const base = absolute ? 'https://archiveofourown.org' : '';
    const chapter =
      this.chapterId === null
        ? `ao3e-chapter/${this.index}`
        : `chapters/${this.chapterId}`;
    const fragment = workskin ? '#workskin' : '';
    return `${base}/works/${this.workId}/${chapter}${fragment}`;
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

export async function getListData<
  T extends typeof ReadingListItem,
  I extends InstanceType<T>
>(type: T): Promise<I[]> {
  const data = await browser.storage.local.get({
    [STORAGE_KEY]: '[]',
  });
  return (JSON.parse(data[STORAGE_KEY]) as Array<unknown>).map(
    (item: unknown) => plainToClass(type, item)
  ) as unknown as I[];
}

export async function setListData<
  T extends typeof ReadingListItem,
  I extends InstanceType<T>
>(data: I[]): Promise<void> {
  await browser.storage.local.set({
    [STORAGE_KEY]: JSON.stringify(
      data.map((item: unknown) => classToPlain(item))
    ),
  });
}
