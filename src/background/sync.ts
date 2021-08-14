import {
  trimergeObject,
  routeMergers,
  RouteWildCard,
  combineMergers,
  trimergeArrayCreator,
  CannotMerge,
  Path,
  MergeFn,
  trimergeEquality,
  RoutePath,
  trimergeMap,
} from 'trimerge';
import { encode as encode32768, decode as decode32768 } from 'base32768';
import clone from 'just-clone';
import dayjs from 'dayjs';
import { LZMA } from 'lzma/src/lzma_worker-min.js';
import { classToPlain } from 'class-transformer';
import objectPath from 'object-path';

import { BaseLogger, childLogger } from '@/common/logger';
import {
  BaseWork,
  getStoragePlain,
  PlainWork,
  RemoteWork,
  setStoragePlain,
  SyncConflict,
  WorkMap,
  workMapPlainParse,
  workMapPlainStringify,
} from '@/common/readingListData';
import { api } from '@/common/api';
import { formatBytes, safeFetch, setDifference, toDoc } from '@/common/utils';
import { options, Options } from '@/common/options';

import { backgroundData, BackgroundWork } from './list';

function mergeLeft(_orig: unknown, left: unknown, _right: unknown): unknown {
  return left;
}

function readDateMerger(
  orig: number | undefined,
  left: number | undefined,
  right: number | undefined
): number | undefined | typeof CannotMerge {
  const base = orig === undefined ? undefined : dayjs(orig);
  const local = left === undefined ? undefined : dayjs(left);
  const remote = right === undefined ? undefined : dayjs.unix(right);
  if (local && remote && local.isSame(remote, 'hour')) return local.valueOf();
  if (base && local && base.isSame(local, 'hour')) return local.valueOf();
  if (local === remote || base === remote) return left;
  if (base === local && remote) return remote.valueOf();
  // TODO: Prefer highest
  return CannotMerge;
}

function toRemoteWork(inItem: PlainWork): RemoteWork {
  const item = clone(inItem);
  delete (item as { title?: string }).title;
  delete (item as { author?: string }).author;
  for (const chapter of item.chapters!) {
    // We don't stickly need these
    delete chapter.chapterId;
    if (chapter.readDate) {
      // Truncate date to save space
      chapter.readDate = dayjs(chapter.readDate)
        .minute(0)
        .second(0)
        .millisecond(0)
        .unix();
    }
  }
  return item;
}

type RootMergeFn = (
  orig: unknown,
  left: unknown,
  right: unknown,
  basePath?: Path,
  mergeFn?: MergeFn
) => unknown | typeof CannotMerge;
export class Merger {
  private merger: RootMergeFn;
  private conflictPathsPerWork: Map<number, Path[]> = new Map();
  private conflicts: Map<number, SyncConflict> = new Map();

  constructor(
    private base: WorkMap<PlainWork>,
    private local: WorkMap<PlainWork>,
    private remote: WorkMap<RemoteWork>
  ) {
    const chapterMerge = trimergeArrayCreator(
      (_, index) => index.toString(),
      true
    );
    const safeChapterMerge: MergeFn = (a, b, c, d, e) =>
      chapterMerge(a || [], b, c, d, e) as unknown;

    const customTrimergeObject: MergeFn = (a, b, c, d, e) => {
      if (a === undefined && c === undefined && b !== undefined)
        return b as unknown;
      if (a === undefined && b === undefined && c !== undefined)
        return c as unknown;
      if (b === undefined && a !== undefined && c !== undefined)
        return b as unknown;
      if (c === undefined && a !== undefined && b !== undefined)
        return c as unknown;
      const x = combineMergers(trimergeObject)(a, b, c, d, e) as unknown;
      return x;
    };

    const work: RoutePath = [RouteWildCard];
    const chapter: RoutePath = [...work, 'chapters', RouteWildCard];
    this.merger = combineMergers(
      this.resolveConflicts.bind(this),
      routeMergers(
        [[], trimergeMap],
        [[...work], customTrimergeObject],
        [[...work, 'title'], mergeLeft],
        [[...work, 'author'], mergeLeft],
        [[...work, 'status'], trimergeEquality],
        [[...work, 'totalChapters'], trimergeEquality],
        [[...work, 'rating'], trimergeEquality],
        [[...work, 'chapters'], safeChapterMerge],
        [[...chapter], customTrimergeObject],
        [[...chapter, 'readDate'], readDateMerger],
        [[...chapter, 'chapterId'], mergeLeft]
      )
    );
  }

  merge(): {
    newLocal: WorkMap<PlainWork>;
    newRemote: WorkMap<RemoteWork>;
  } {
    const newLocal = this.merger(
      this.base,
      this.local,
      this.remote
    ) as WorkMap<PlainWork>;
    const newRemote = new Map(
      Array.from(newLocal).map(([workId, work]) => [workId, toRemoteWork(work)])
    );
    return { newLocal, newRemote };
  }

  getConflicts(): Map<number, SyncConflict> {
    const result = this.gatherConflicts(this.merger)(
      this.base,
      this.local,
      this.remote
    ) as WorkMap<PlainWork>;
    for (const [workId, paths] of this.conflictPathsPerWork) {
      const local = clone(this.local.get(workId)!);
      const remote = clone(this.remote.get(workId)!);
      remote.chapters = remote.chapters.map((chapter) => {
        if (chapter.readDate) {
          chapter.readDate *= 1000;
        }
        return chapter;
      });
      (remote as PlainWork).title = local.title;
      (remote as PlainWork).author = local.author;
      const conflict = new SyncConflict(
        workId,
        paths,
        BaseWork.fromPlain(workId, local),
        BaseWork.fromPlain(workId, remote as PlainWork),
        BaseWork.fromPlain(workId, clone(result.get(workId)!))
      );
      this.conflicts.set(workId, conflict);
    }
    return this.conflicts;
  }

  private resolveConflicts(
    _orig: unknown,
    _left: unknown,
    _right: unknown,
    path: Path
  ): unknown | typeof CannotMerge {
    if (path.length < 1) return CannotMerge;
    const workId = parseInt(path[0].toString());
    const conflict = this.conflicts.get(workId);
    if (conflict) {
      if (
        conflict.paths.some((p) => p.every((v, i) => v === path.slice(1)[i]))
      ) {
        return objectPath.get(conflict.value, path.slice(1));
      }
    }
    return CannotMerge;
  }

  private gatherConflicts(merger: MergeFn): RootMergeFn {
    const conflictGatherMerger: RootMergeFn = (
      orig,
      left,
      right,
      path = [],
      mergeFn = conflictGatherMerger
    ): unknown => {
      const result = merger(orig, left, right, path, mergeFn) as unknown;
      if (result !== CannotMerge) return result;
      const workId = parseInt(path[0].toString());
      const paths =
        this.conflictPathsPerWork.get(workId) ||
        (() => {
          const paths: Path[] = [];
          this.conflictPathsPerWork.set(workId, paths);
          return paths;
        })();
      paths.push(path.slice(1));
    };
    return conflictGatherMerger;
  }
}

export class Syncer {
  readonly READING_LIST_TAG = 'In AO3 Enhancements Reading List';
  readonly STATUS_TAG_MAP = {
    read: 'Read',
    toRead: 'To Read',
    dropped: 'Dropped',
    reading: 'Reading',
    unread: 'Unread',
    onHold: 'On Hold',
  };
  readonly STATUS_TAGS = Array.from(Object.values(this.STATUS_TAG_MAP));
  readonly logger: BaseLogger;
  readonly sender: browser.runtime.MessageSender;

  _token: string | null = null;
  options!: Options;

  constructor(sender: browser.runtime.MessageSender) {
    this.logger = childLogger('BG/sync');

    this.sender = sender;
  }

  async sync(): Promise<void> {
    this.options = await options.get(options.ALL);
    const key = {
      previous: 'readingList.previous',
      list: 'readingList.list',
      lastSync: 'readingList.lastSync',
    };
    const data = await browser.storage.local.get({
      [key.lastSync]: undefined,
    });
    const lastSync = data[key.lastSync]
      ? dayjs(data[key.lastSync] as number)
      : undefined;

    // - Fetch local data
    this.progress('Fetching local data');
    const previous = await getStoragePlain(key.previous);
    const local = await getStoragePlain(key.list);

    // - Fetch remote data
    this.progress('Fetching remote data');
    const remote = await this.fetchCollectionData();

    this.logger.log(
      workMapPlainStringify(previous),
      workMapPlainStringify(local),
      workMapPlainStringify(remote)
    );

    // Setup merger
    this.progress('Starting merging');
    const merger = new Merger(previous, local, remote);

    // - Resolve conflicts
    this.progress('Resolving conflicts');
    const conflicts = merger.getConflicts();
    this.logger.log('conflicts', conflicts);

    for (const conflict of conflicts.values()) {
      const choice = await api.readingListSyncConflict.sendCS(
        this.sender.tab!.id!,
        this.sender.frameId!,
        conflict
      );
      conflict.chosen = choice;
    }
    this.logger.log('conflicts', conflicts);

    // - Merge
    this.progress('Merging');
    const { newLocal, newRemote } = merger.merge();
    this.logger.log(newLocal, newRemote);
    console.log(workMapPlainStringify(newLocal));

    // - Upload remote
    this.progress('Uploading data');
    const remoteLength = await this.uploadCollectionData(newRemote);

    // - Fetch bookmarks + update title/authors

    // - Merge bookmarks

    // - Delete old bookmarks

    // - Create new bookmarks

    // - Fetch missing title/authors
    const missingData = [];
    for (const [workId, work] of newLocal) {
      if (
        !Object.prototype.hasOwnProperty.call(work, 'title') ||
        !Object.prototype.hasOwnProperty.call(work, 'author')
      ) {
        missingData.push(workId);
      }
    }
    for (const [i, workId] of missingData.entries()) {
      this.progress('Fetching missing titles/authors', [i, missingData.length]);
      const updatedItem = await BackgroundWork.fetch(workId);
      updatedItem.assignRemote(newLocal.get(workId)!);
      newLocal.set(workId, classToPlain(updatedItem) as PlainWork);
    }

    // - Update local
    // - Update previous
    // - Update lastSync
    this.progress('Setting new local data');
    await setStoragePlain(newLocal, key.list);
    await setStoragePlain(newLocal, key.previous);
    await browser.storage.local.set({
      [key.lastSync]: dayjs().valueOf(),
    });

    // - Propagate changes
    this.progress('Propagating updates');
    await backgroundData.init();
    const removed = setDifference(
      new Set(local.keys()),
      new Set(newLocal.keys())
    );
    if (removed.size > 0) {
      await backgroundData.propagateChanges(
        Array.from(removed).map((workId) => ({
          workId: workId,
          work: null,
        }))
      );
    }
    void api.readingListSyncProgress.sendCS(
      this.sender.tab!.id!,
      this.sender.frameId!,
      `Sync complete. Used data: ${formatBytes(remoteLength)}/100KB.`,
      true,
      false
    );

    // TODO: If more than 10 bookmarks added show warning to wait before syncing on other device.
  }

  progress(text: string, subprogress?: [number, number]): void {
    let progress = `${text}...`;
    let overwrite = false;
    if (subprogress) {
      progress += ` (${subprogress[0]}/${subprogress[1]})`;
      overwrite = true;
    }
    void api.readingListSyncProgress.sendCS(
      this.sender.tab!.id!,
      this.sender.frameId!,
      progress,
      false,
      overwrite
    );
  }

  async fetchCollectionData(): Promise<WorkMap<RemoteWork>> {
    const res = await safeFetch(
      `https://archiveofourown.org/collections/${this.options.readingListCollectionId}/profile`
    );
    const doc = await toDoc(res);
    const dataLink = doc.querySelector(
      '#intro a[href="/ao3e-reading-list"]'
    ) as HTMLAnchorElement | null;
    this.logger.log(dataLink);
    if (!dataLink) return new Map();
    const rawData = dataLink.title;
    const decoded = decode32768(rawData);
    const uncompressed = LZMA.decompress(decoded);
    const data = workMapPlainParse<RemoteWork>(uncompressed);
    return data;
  }

  async uploadCollectionData(rawData: WorkMap<RemoteWork>): Promise<number> {
    this.logger.log(rawData);
    const json = workMapPlainStringify(rawData);
    const compressed = LZMA.compress(json, 1);
    const encoded = encode32768(compressed);
    const strData = `<a href="/ao3e-reading-list" title="${encoded}"></a>|Data Hidden|`;

    const editRes = await safeFetch(
      `https://archiveofourown.org/collections/${this.options.readingListCollectionId}/edit`
    );
    const editDoc = await toDoc(editRes);
    const editForm = editDoc.querySelector(
      'form.post.collection'
    ) as HTMLFormElement | null;
    if (!editForm) throw new Error('Could not find edit form.');
    const formData = new FormData(editForm);
    formData.set('collection[collection_profile_attributes][intro]', strData);

    const submitRes = await safeFetch(
      `https://archiveofourown.org/collections/${this.options.readingListCollectionId}`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const submitDoc = await toDoc(submitRes);
    const error = submitDoc.querySelector('.error ul');
    if (error) {
      throw new Error(error.textContent!);
    }
    return strData.length;
  }

  // bookmarkData(item: BaseWork, data: URLSearchParams): URLSearchParams {
  //   // TODO: Allow selecting a psued id
  //   const readingListPsued = { id: '42' };
  //   if (!readingListPsued) {
  //     throw new Error(
  //       "Can't update bookmark: Missing collection and pseud id option."
  //     );
  //   }

  //   // Tags
  //   const tags = (data.get('bookmark[tag_string]') || '')
  //     .split(',')
  //     .map((tag) => tag.trim())
  //     .filter(
  //       (tag) =>
  //         !this.STATUS_TAGS.includes(tag) &&
  //         tag !== '' &&
  //         tag !== this.READING_LIST_TAG
  //     );
  //   tags.push(this.STATUS_TAG_MAP[item.status]);
  //   tags.push(this.READING_LIST_TAG);
  //   data.set('bookmark[tag_string]', tags.join(','));

  //   // Notes
  //   // let notes = data.get('bookmark[bookmarker_notes]') || '';
  //   // const link = `<a href="${item.dataURL}"></a>`;
  //   // const re = /<a href="[^"]*\/ao3e-reading-list\/\d+\?.*">.*<\/a>/;
  //   // if (re.exec(notes)) {
  //   //   notes = notes.replace(re, link);
  //   // } else {
  //   //   notes += link;
  //   // }
  //   // data.set('bookmark[bookmarker_notes]', notes);

  //   // Collection ids
  //   const collections = (data.get('bookmark[collection_names]') || '')
  //     .split(',')
  //     .filter((collection) => collection !== '');
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

  // async createBookmark(item: BaseWork): Promise<number> {
  //   const token = await this.getToken();
  //   const q = new URLSearchParams([
  //     ['authenticity_token', token],
  //     ['commit', 'Create'],
  //     ['utf8', '✓'],
  //   ]);
  //   const data = this.bookmarkData(item, q);
  //   return this._createBookmark(item.workId, data);
  // }

  // async _createBookmark(
  //   workId: number,
  //   data: URLSearchParams
  // ): Promise<number> {
  //   const res = await this.fetch(
  //     `https://archiveofourown.org/works/${workId}/bookmarks`,
  //     { method: 'post', body: data }
  //   );
  //   await this.toDoc(res);
  //   const resPaths = new URL(res.url).pathname.split('/');
  //   if (resPaths.length !== 3 || resPaths[1] !== 'bookmarks') {
  //     throw new Error(
  //       'Create bookmark did not redirect like we thought it would.'
  //     );
  //   }
  //   const bookmarkId = parseInt(resPaths[2]);
  //   return bookmarkId;
  // }

  // // async updateBookmark(
  // //   item: ReadingListItem & { bookmarkId: number }
  // // ): Promise<number> {
  // //   // TODO: allow error since maybe the bookmark was deleted, in which case try and remake
  // //   const editDoc = await this.toDoc(
  // //     await this.fetch(
  // //       `https://archiveofourown.org/bookmarks/${item.bookmarkId}/edit`
  // //     )
  // //   );
  // //   const bookmarkForm = editDoc.querySelector(
  // //     '#bookmark-form form'
  // //   ) as HTMLFormElement | null;
  // //   if (bookmarkForm === null) throw new Error('Mising bookmark form.');
  // //   const oldData = new URLSearchParams(
  // //     new FormData(bookmarkForm) as unknown as string[][]
  // //   );

  // //   await this.deleteBookmark(item);

  // //   const newData = this.bookmarkData(item, oldData);
  // //   newData.set('commit', 'Create');
  // //   newData.delete('_method');

  // //   return await this._createBookmark(item.workId, newData);
  // // }

  // async deleteBookmark(item: BaseWork & { bookmarkId: number }): Promise<void> {
  //   const token = await this.getToken();
  //   const data = new URLSearchParams([
  //     ['authenticity_token', token],
  //     ['_method', 'delete'],
  //   ]);
  //   const res = await this.fetch(
  //     `https://archiveofourown.org/bookmarks/${item.bookmarkId}`,
  //     {
  //       method: 'post',
  //       body: data,
  //     }
  //   );
  //   await this.toDoc(res);
  // }
}

api.readingListSync.addListener(async (_, sender) => {
  const syncer = new Syncer(sender!);
  await syncer.sync();
});
