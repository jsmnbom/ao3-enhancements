import 'reflect-metadata';
import {
  classToPlain,
  Exclude,
  Expose,
  plainToClass,
  Transform,
  Type,
} from 'class-transformer';
import dayjs, { Dayjs } from 'dayjs';
import { jsonEqual, Path } from 'trimerge';
import {
  mdiAllInclusive,
  mdiBookOpenVariant,
  mdiCheckOutline,
  mdiClock,
  mdiHandLeft,
  mdiThumbDownOutline,
} from '@mdi/js';

import { api } from './api';

export const WORK_STATUSES = [
  'reading',
  'toRead',
  'onHold',
  'read',
  'dropped',
] as const;

export type WorkStatus = typeof WORK_STATUSES[number];

export function statusText(status?: WorkStatus): string {
  switch (status) {
    case 'dropped':
      return 'dropped';
    case 'toRead':
      return 'plan to read';
    case 'read':
      return 'fully read';
    case 'reading':
      return 'currently reading';
    case 'onHold':
      return 'on hold';
  }
  return 'never read';
}

export function upperStatusText(status?: WorkStatus): string {
  const s = statusText(status);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const WORK_STATUSES_ICONS = {
  all: mdiAllInclusive,
  reading: mdiBookOpenVariant,
  toRead: mdiClock,
  onHold: mdiHandLeft,
  read: mdiCheckOutline,
  dropped: mdiThumbDownOutline,
} as const;

export interface PlainChapter {
  chapterId?: number;
  readDate: number | undefined | true;
}
export interface PlainWork {
  chapters: PlainChapter[];
  title: string;
  author: string;
  totalChapters: number | null;
  status?: WorkStatus;
  bookmarkId?: number;
  rating: number;
  fandoms?: string[];
  description?: string;
  tags?: string[];
  wordCount?: number;
}

export interface RemoteChapter {
  readDate: number | undefined | true;
}
export interface RemoteWork {
  chapters: RemoteChapter[];
  totalChapters: number | null;
  status?: WorkStatus;
  bookmarkId?: number;
  rating: number;
}

export class SyncConflict {
  @Type(() => BaseWork)
  public local: BaseWork;
  @Type(() => BaseWork)
  public remote: BaseWork;
  @Type(() => BaseWork)
  public result: BaseWork;

  public chosen: 'local' | 'remote' | null = null;

  constructor(
    public workId: number,
    public paths: Path[],
    local: BaseWork,
    remote: BaseWork,
    result: BaseWork
  ) {
    this.local = local;
    this.remote = remote;
    this.result = result;
  }

  get value(): BaseWork {
    if (this.chosen === 'local') return this.local;
    if (this.chosen === 'remote') return this.remote;
    throw new Error('Conflict not resolved.');
  }

  public static fromPlain(data: unknown): SyncConflict {
    (data as SyncConflict).remote.workId = (data as SyncConflict).workId;
    (data as SyncConflict).local.workId = (data as SyncConflict).workId;
    return plainToClass(this, data) as unknown as SyncConflict;
  }

  public checkPath(path: Path): boolean {
    return this.paths.some((p) =>
      p.every((v, i) => String(v) === String(path[i]) || i === p.length - 1)
    );
  }
}

export function updateWork<T extends BaseWork | PlainWork>(
  base: T,
  update: PlainWork
): boolean {
  let change = false;
  const simple = [
    'title',
    'author',
    'totalChapters',
    'fandoms',
    'description',
    'tags',
    'wordCount',
  ] as const;
  for (const key of simple) {
    if (!jsonEqual(base[key], update[key]) && update[key] !== undefined) {
      change = true;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      base[key] = update[key];
    }
  }
  if (base.chapters.length !== update.chapters.length) {
    change = true;
  }
  for (
    let i = 0;
    i < Math.max(base.chapters.length, update.chapters.length);
    i++
  ) {
    // TODO: What happens when a chapter is updated? Does its chapterId change?
    // figure that out and update code so if e.g. chapterid=3 is read, then it will keep being read, even if prev chapter is deleted
    if (base.chapters[i] && update.chapters[i]) {
      const ts = base.chapters[i];
      const ds = update.chapters[i];
      if (ds.chapterId !== undefined && ts.chapterId !== ds.chapterId) {
        change = true;
        ts.chapterId = ds.chapterId;
      }
    } else if (base.chapters[i] && !update.chapters[i]) {
      delete base.chapters[i];
    } else if (!base.chapters[i] && update.chapters[i]) {
      base.chapters[i] = update.chapters[i];
    }
  }

  return change;
}

export class BaseWork {
  @Type(() => BaseChapter)
  @Transform(
    ({ value: chapters, obj: item }) => {
      return (chapters as BaseChapter[]).map((chapter, index) => {
        chapter.workId = (item as BaseWork).workId;
        chapter.index = index;
        return chapter;
      });
    },
    { toClassOnly: true }
  )
  chapters: BaseChapter[];
  @Exclude({ toPlainOnly: true })
  workId: number;
  @Expose({ name: 'title' })
  _title?: string;
  @Expose({ name: 'author' })
  _author?: string;
  totalChapters: number | null;
  status?: WorkStatus;
  bookmarkId?: number;
  rating: number;
  fandoms?: string[];
  tags?: string[];
  description?: string;
  wordCount?: number;

  constructor(
    workId: number,
    title: string,
    author: string,
    status: WorkStatus | undefined,
    chapters: BaseChapter[],
    totalChapters: number | null,
    fandoms?: string[],
    tags?: string[],
    description?: string,
    wordCount?: number
  ) {
    this.workId = workId;
    this._title = title;
    this._author = author;
    this.status = status;
    this.chapters = chapters;
    this.totalChapters = totalChapters;
    this.rating = 0;
    this.fandoms = fandoms;
    this.tags = tags;
    this.description = description;
    this.wordCount = wordCount;
  }

  public get title(): string {
    return this._title || `unknown work (${this.workId})`;
  }

  public set title(title: string) {
    this._title = title;
  }
  public get author(): string {
    return this._author || `Open work or sync to fetch work information.`;
  }

  public set author(author: string) {
    this._author = author;
  }

  public static fromWorkPage<T extends typeof BaseWork>(
    workId: number,
    doc: Document
  ): InstanceType<T> {
    let chapters;
    const chapterSelect = doc.querySelector('#chapter_index select');
    if (chapterSelect) {
      chapters = Array.from(chapterSelect.options).map(
        (option, i) => new BaseChapter(i, workId, parseInt(option.value))
      );
    } else {
      // Only 1 chapter or ?show_full_work=true
      const chapterHeaders = document.querySelectorAll(
        '.chapter.preface.group > .title > a'
      );
      if (chapterHeaders.length > 0) {
        chapters = Array.from(chapterHeaders).map((el, idx) => {
          const chapterId = parseInt(new URL(el.href!).pathname.split('/')[4]);
          return new BaseChapter(idx, workId, chapterId);
        });
      } else {
        chapters = [new BaseChapter(0, workId)];
      }
    }
    const [_, total] = (
      doc.querySelector('#main .work.meta.group .stats dd.chapters')
        ?.textContent || '1/?'
    )
      .split('/')
      .map((i) => (i === '?' ? null : parseInt(i)));

    const workskin = doc.querySelector('#workskin')!;

    const title = (
      workskin.querySelector('h2.title')?.textContent || 'unknown title'
    ).trim();
    const author = (
      workskin.querySelector('h3.byline')?.textContent || 'Anonymous'
    ).trim();

    const meta = doc.querySelector('#main dl.work.meta')!;
    const fandoms = Array.from(meta.querySelectorAll('dd.fandom a.tag')).map(
      (tag) => tag.innerText.trim()
    );
    const description = workskin
      .querySelector(
        '.preface.group:not(.chapter) .summary blockquote.userstuff'
      )
      ?.innerText.trim();
    const tags = Array.from(
      meta.querySelectorAll(
        ':is(dd.rating, dd.warning, dd.category, dd.relationship, dd.character, dd.freeform) a.tag'
      )
    ).map((tag) => tag.innerText.trim());
    const wordCount = parseInt(
      meta.querySelector('.stats dd.words')!.textContent!.replace(/,/g, '')
    );

    return new this(
      workId,
      title,
      author,
      undefined,
      chapters,
      total,
      fandoms,
      tags,
      description,
      wordCount
    ) as InstanceType<T>;
  }

  public static fromListingBlurb<T extends typeof BaseWork>(
    workId: number,
    blurb: HTMLElement
  ): InstanceType<T> {
    const [written, total] = (
      blurb.querySelector('.stats dd.chapters')?.textContent || '1/?'
    )
      .split('/')
      .map((i) => (i === '?' ? null : parseInt(i)));
    const chapters = new Array(written!)
      .fill(undefined)
      .map((_, i) => new BaseChapter(i, workId));

    const title =
      blurb.querySelector('.heading > a')?.textContent || 'unknown title';
    const author =
      Array.from(blurb.querySelectorAll('.heading > a[rel="author"]'))
        .map((a) => a.textContent)
        .join(', ') || 'Anonymous';

    const fandoms = Array.from(blurb.querySelectorAll('.fandoms a.tag')).map(
      (tag) => tag.innerText.trim()
    );
    const description = blurb
      .querySelector('blockquote.userstuff.summary')
      ?.innerText.trim();
    const requiredTags = blurb.querySelector('ul.required-tags')!;
    const tags: string[] = [
      (requiredTags.children[0] as HTMLElement).innerText.trim(),
      ...Array.from(blurb.querySelectorAll('.tags .warnings a.tag')).map(
        (tag) => tag.innerText.trim()
      ),
      ...(requiredTags.children[2] as HTMLElement).innerText
        .trim()
        .split(',')
        .map((tag) => tag.trim()),
      ...Array.from(
        blurb.querySelectorAll(
          '.tags :is(.relationships, .characters, .freeforms) a.tag'
        )
      ).map((tag) => tag.innerText.trim()),
    ];
    const wordCount = parseInt(
      blurb.querySelector('.stats dd.words')!.textContent!.replace(/,/g, '')
    );

    return new this(
      workId,
      title,
      author,
      undefined,
      chapters,
      total,
      fandoms,
      tags,
      description,
      wordCount
    ) as InstanceType<T>;
  }

  public static fromPlain<T extends typeof BaseWork>(
    workId: number,
    data: PlainWork
  ): InstanceType<T> {
    (data as BaseWork).workId = workId;
    return plainToClass(this, data) as InstanceType<T>;
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
  }

  public get linkURL(): string {
    return `https://archiveofourown.org/ao3e-reading-list/${this.workId}`;
  }

  public get bookmarkHref(): string | undefined {
    if (!this.bookmarkId) return undefined;
    return `https://archiveofourown.org/bookmarks/${this.bookmarkId}`;
  }

  public get isInList(): boolean {
    return this.isAnyChaptersRead || !!this.status;
  }

  public update(data: BaseWork): boolean {
    return updateWork(this, classToPlain(data) as PlainWork);
  }

  public assignRemote(data: RemoteWork): void {
    this.status = data.status;
    this.rating = data.rating;
    this.bookmarkId = data.bookmarkId;
    this.totalChapters = data.totalChapters;
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
        if (ds.readDate !== undefined) {
          ts.readDate = Number.isInteger(ds.readDate)
            ? dayjs(ds.readDate as number)
            : (ds.readDate as undefined | true);
        }
      } else if (this.chapters[i] && !data.chapters[i]) {
        delete this.chapters[i];
      } else if (!this.chapters[i] && data.chapters[i]) {
        this.chapters[i] = new BaseChapter(i, this.workId);
      }
    }
  }
}

export class BaseChapter {
  @Transform(
    ({ value }: { value: number | undefined | true }) => {
      if (Number.isInteger(value)) {
        return dayjs(value as number);
      }
      return value;
    },
    { toClassOnly: true }
  )
  @Transform(
    ({ value }: { value: Dayjs | undefined | true }) => {
      if (value instanceof dayjs) {
        return value.valueOf();
      }
      return value;
    },
    {
      toPlainOnly: true,
    }
  )
  readDate: Dayjs | undefined | true;
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
    return this.readDate
      ? this.readDate instanceof dayjs
        ? `read ${(this.readDate as Dayjs).format('YYYY-MM-DD')}`
        : 'read'
      : 'unread';
  }

  public getHref(absolute = false, workskin = false): string {
    const base = absolute ? 'https://archiveofourown.org' : '';
    const chapter =
      this.chapterId === undefined
        ? this.index === 0
          ? ''
          : `/ao3e-chapters/${this.index + 1}`
        : `/chapters/${this.chapterId}`;
    const fragment = workskin ? '#workskin' : '';
    return `${base}/works/${this.workId}${chapter}${fragment}`;
  }
}

export type WorkMap<T = BaseWork> = Map<number, T>;
export type WorkMapObject<T = BaseWork> = { [workId: string]: T };

type DataCallback<I> = (workId: number, work: I | null) => void;

export class BaseDataWrapper<T extends typeof BaseWork> {
  constructor(protected type: T) {}

  toPlain<T extends BaseWork>(workMap: WorkMap<T>): WorkMap<PlainWork> {
    return new Map(
      Array.from(workMap).map(([workId, work]) => [
        workId,
        classToPlain(work) as PlainWork,
      ])
    );
  }

  fromPlain<
    R extends BaseWork,
    T extends { fromPlain(workId: number, plain: PlainWork): R }
  >(type: T, plainMap: WorkMap<PlainWork>): WorkMap<R> {
    return new Map(
      Array.from(plainMap).map(([workId, plain]) => [
        workId,
        type.fromPlain(workId, plain),
      ])
    );
  }
}

export interface WorkChange {
  workId: number;
  work: PlainWork | null;
}

export class ContentDataWrapper<
  T extends typeof BaseWork,
  I = InstanceType<T>,
  C extends DataCallback<I> = DataCallback<I>
> extends BaseDataWrapper<T> {
  private registeredCallbacks: {
    workIds: number | number[] | null;
    callback: C;
  }[] = [];

  constructor(type: T) {
    super(type);
    const port = browser.runtime.connect();
    port.onMessage.addListener((rawData) => {
      const data = rawData as unknown as { changes: WorkChange[] };
      for (const change of data.changes) {
        const workId = change.workId;
        const work = change.work;
        for (const { workIds, callback } of this.registeredCallbacks) {
          if (
            workIds === null ||
            workIds === workId ||
            (Array.isArray(workIds) && workIds.includes(workId))
          ) {
            callback(
              workId,
              work !== null
                ? (this.type.fromPlain(workId, work) as unknown as I)
                : null
            );
          }
        }
      }
    });
  }

  async get(): Promise<WorkMap<InstanceType<T>>> {
    return this.fromPlain(
      this.type,
      workMapPlainParse(await api.readingListFetch.sendBG())
    );
  }

  addListener(callback: C, workIds: number | number[] | null): void {
    this.registeredCallbacks.push({ workIds, callback });
  }
}

const STORAGE_KEY = 'readingList.list';

export function workMapPlainParse<T>(data: string): WorkMap<T> {
  return new Map(
    Object.entries(JSON.parse(data) as { [workId: string]: T }).map(
      ([workId, work]) => [parseInt(workId), work]
    )
  );
}

export function workMapPlainStringify<T>(data: WorkMap<T>): string {
  return JSON.stringify(
    Object.fromEntries(
      Array.from(data).map(([workId, work]) => [workId.toString(), work])
    )
  );
}

export async function getStoragePlain(
  key = STORAGE_KEY
): Promise<WorkMap<PlainWork>> {
  const data = await browser.storage.local.get({
    [key]: '{}',
  });
  return workMapPlainParse(data[key]);
}

export async function setStoragePlain(
  plainMap: WorkMap<PlainWork>,
  key = STORAGE_KEY
): Promise<void> {
  await browser.storage.local.set({
    [key]: workMapPlainStringify(plainMap),
  });
}
