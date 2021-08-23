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
  trimergeMapCreator,
} from 'trimerge';
import { encode as encode32768, decode as decode32768 } from 'base32768';
import clone from 'just-clone';
import dayjs, { Dayjs } from 'dayjs';
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
  updateWork,
  WorkMap,
  workMapPlainParse,
  workMapPlainStringify,
} from '@/common/readingListData';
import { api, SyncAbort, SyncError } from '@/common/api';
import {
  fetchToken,
  formatBytes,
  objectMapEqual,
  safeFetch,
  setDifference,
  toDoc,
} from '@/common/utils';
import { options, Options, ReadDateResolution } from '@/common/options';

import { backgroundData, BackgroundWork } from './list';

function mergeLeft(_orig: unknown, left: unknown, _right: unknown): unknown {
  return left;
}
function readDateMerger(
  orig: number | undefined | true,
  left: number | undefined | true,
  right: number | undefined | true
): number | undefined | typeof CannotMerge {
  const isSame = (a: true | Dayjs | undefined, b: true | Dayjs | undefined) => {
    if (a === undefined && b === undefined) return true;
    if (
      (a === undefined && b !== undefined) ||
      (a !== undefined && b === undefined)
    )
      return false;
    return (
      (a === true && b === true) ||
      (a === true && b) ||
      (a && b === true) ||
      (a as Dayjs).isSame(b as Dayjs, 'day')
    );
  };
  const value = (x: true | Dayjs | undefined) => {
    if (x instanceof dayjs) return (x as Dayjs).valueOf();
    return x;
  };

  const base =
    orig === undefined
      ? undefined
      : Number.isInteger(orig)
      ? dayjs(orig as number)
      : true;
  const local =
    left === undefined
      ? undefined
      : Number.isInteger(left)
      ? dayjs(left as number)
      : true;
  const remote =
    right === undefined
      ? undefined
      : Number.isInteger(right)
      ? dayjs(right as number)
      : true;
  // console.log(base, local, remote);
  if (isSame(local, remote)) return value(local);
  if (isSame(base, local)) return value(remote);
  if (isSame(base, remote)) value(local);
  return CannotMerge;
}

function toRemoteWork(
  inWork: PlainWork,
  readDateResolution: ReadDateResolution
): RemoteWork {
  const work = clone(inWork);
  delete (work as { title?: string }).title;
  delete (work as { author?: string }).author;
  for (const chapter of work.chapters!) {
    delete chapter.chapterId;
    // This should not be necessary, but maybe it is???
    delete (chapter as unknown as { index: unknown }).index;
    delete (chapter as unknown as { workId: unknown }).workId;
    if (chapter.readDate && chapter.readDate !== true) {
      if (readDateResolution === 'day') {
        chapter.readDate = dayjs(chapter.readDate)
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .unix();
      }
      if (readDateResolution === 'boolean') {
        chapter.readDate = true;
      }
      // Truncate date to save space
    }
  }
  return work;
}

// TODO: TEST THIS
// Actually only fixes readdates
function fromRemoteWork(work: RemoteWork): RemoteWork {
  for (const chapter of work.chapters!) {
    if (chapter.readDate && chapter.readDate !== true) {
      chapter.readDate *= 1000;
    }
  }
  return work;
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
        [[], trimergeMapCreator(true)],
        [[...work], customTrimergeObject],
        [[...work, 'title'], mergeLeft],
        [[...work, 'author'], mergeLeft],
        [[...work, 'bookmarkId'], trimergeEquality],
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

  merge(): WorkMap<PlainWork> {
    const newLocal = this.merger(
      this.base,
      this.local,
      this.remote
    ) as WorkMap<PlainWork>;
    return newLocal;
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
  readonly BOOKMARK_IN_LIST_TAG = 'In AO3 Enhancements Reading List';
  readonly BOOKMARK_TAGS = [
    this.BOOKMARK_IN_LIST_TAG,
    'Do not delete manually',
  ];
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
    };

    // - Fetch local data
    this.sendProgress('Fetching local data');
    const previous = await getStoragePlain(key.previous);
    const local = await getStoragePlain(key.list);

    // - Fetch remote data
    this.sendProgress('Fetching remote data');
    const remoteData = await this.fetchCollectionData();
    const remote = remoteData[0];
    let remoteLength = remoteData[1];

    this.logger.log(
      workMapPlainStringify(previous),
      workMapPlainStringify(local),
      workMapPlainStringify(remote)
    );

    // Setup merger
    this.sendProgress('Starting merging');
    const merger = new Merger(previous, local, remote);

    // - Resolve conflicts
    await this.resolveConflicts(merger);

    // - Merge
    this.sendProgress('Merging');
    const newLocal = merger.merge();
    this.logger.log(newLocal);
    console.log(workMapPlainStringify(newLocal));

    // - Fetch missing data
    await this.fetchMissing(newLocal);

    // Check for work updates
    this.sendProgress('Checking for updated works');
    await this.checkUpdated(newLocal);

    try {
      // - Delete old bookmarks
      const leftoverBookmarks = Array.from(remote).filter(
        ([workId, work]) =>
          work.bookmarkId !== undefined && newLocal.get(workId) === undefined
      );
      for (const [i, [_, work]] of leftoverBookmarks.entries()) {
        this.sendProgress('Deleting bookmarks', [i, leftoverBookmarks.length]);
        await this.deleteBookmark(work.bookmarkId!);
      }

      // - Create new bookmarks
      const missingBookmarks = Array.from(newLocal).filter(
        ([_, work]) => work.bookmarkId === undefined
      );
      for (const [i, [workId, work]] of missingBookmarks.entries()) {
        this.sendProgress('Creating bookmarks', [i, missingBookmarks.length]);
        if (work.bookmarkId === undefined) {
          const bookmarkId = await this.createBookmark(workId);
          work.bookmarkId = bookmarkId;
        }
      }
    } finally {
      try {
        // - Upload remote
        const newRemote = new Map(
          Array.from(newLocal).map(([workId, work]) => [
            workId,
            toRemoteWork(work, this.options.readingListReadDateResolution),
          ])
        );
        if (!objectMapEqual(remote, newRemote)) {
          this.sendProgress('Uploading data');
          remoteLength = await this.uploadCollectionData(newRemote);
        }

        // - Update local
        // - Update previous
        this.sendProgress('Setting new local data');
        await setStoragePlain(newLocal, key.list);
        await setStoragePlain(newLocal, key.previous);
      } finally {
        // - Propagate changes
        await this.propagateChanges(local, newLocal);
      }
    }

    void api.readingListSyncProgress.sendCS(
      this.sender.tab!.id!,
      this.sender.frameId!,
      `Sync complete. Used data: ${formatBytes(remoteLength).replace(
        ' ',
        '&nbsp;'
      )}/100KB.`,
      true,
      false
    );
  }
  async checkUpdated(newLocal: WorkMap<PlainWork>, page = 1): Promise<void> {
    const pageData = await this.fetchBookmarks('bookmarkable_date', page);
    const updated = new Map(
      Array.from(pageData.keys()).map((workId) => [workId, false])
    );
    for (const [workId, update] of pageData) {
      if (newLocal.has(workId)) {
        updated.set(workId, updateWork(newLocal.get(workId)!, update));
      }
    }
    if (updated.size > 0 && Array.from(updated.values()).every((x) => x)) {
      await this.checkUpdated(newLocal, page + 1);
    }
  }
  async fetchMissing(newLocal: WorkMap<PlainWork>): Promise<void> {
    const missingData = new Set<number>();
    for (const [workId, work] of newLocal) {
      if (
        !Object.prototype.hasOwnProperty.call(work, 'title') ||
        !Object.prototype.hasOwnProperty.call(work, 'author')
      ) {
        missingData.add(workId);
      }
    }
    if (missingData.size) {
      this.sendProgress('Fetching missing metadata via bookmarks');
      const missingBookmarkIds = Array.from(missingData).map(
        (workId) => newLocal.get(workId)!.bookmarkId!
      );
      const lowestMissing = Math.min(...missingBookmarkIds);
      let lowestFound = 0;

      let page = 1;

      do {
        const pageData = await this.fetchBookmarks('created_at', page);
        const foundBookmarkIds = Array.from(pageData).map(
          ([_, work]) => work.bookmarkId!
        );
        if (foundBookmarkIds.length < 1) break;
        lowestFound = Math.min(...foundBookmarkIds);
        for (const [workId, work] of pageData) {
          work.assignRemote(newLocal.get(workId)!);
          newLocal.set(workId, classToPlain(work) as PlainWork);
          missingData.delete(workId);
        }
        page++;
      } while (lowestFound > lowestMissing);

      if (missingData.size >= 10) {
        const action = await api.readingListSyncMissingDataWarning.sendCS(
          this.sender.tab!.id!,
          this.sender.frameId!,
          missingData.size
        );
        if (action === 'abort') throw new SyncAbort();
        if (action === 'blank') return;
      }
      await this.fetchMissingDirect(missingData, newLocal);
    }
  }

  private async fetchBookmarks(
    sort: 'bookmarkable_date' | 'created_at',
    page: number
  ): Promise<WorkMap<BackgroundWork>> {
    const url = new URL('https://archiveofourown.org/bookmarks');
    const data = new URLSearchParams([
      ['utf8', '✓'],
      ['commit', 'Sort and Filter'],
      ['bookmark_search[sort_column]', sort],
      ['bookmark_search[other_tag_names]', ''],
      ['bookmark_search[other_bookmark_tag_names]', this.BOOKMARK_IN_LIST_TAG],
      ['bookmark_search[excluded_tag_names]', ''],
      ['bookmark_search[excluded_bookmark_tag_names]', ''],
      ['bookmark_search[bookmarkable_query]', ''],
      ['bookmark_search[bookmark_query]', ''],
      ['bookmark_search[language_id]', ''],
      ['bookmark_search[rec]', '0'],
      ['bookmark_search[with_notes]', '0'],
      ['pseud_id', this.options.readingListPsued!.name],
      ['user_id', this.options.user!.username],
      ['page', page.toString()],
    ]);
    url.search = data.toString();
    const res = await safeFetch(url.toString());
    const doc = await toDoc(res);
    const blurbs = doc.querySelectorAll('li.bookmark.blurb.group');
    const map = new Map();
    for (const blurb of blurbs) {
      const headingHref = blurb.querySelector('.heading a')?.href;
      if (!headingHref) continue;
      const headingURL = new URL(headingHref);
      const headingPaths = headingURL.pathname.split('/');
      if (headingPaths.length !== 3 || headingPaths[1] !== 'works') continue;
      const workId = parseInt(headingPaths[2]);
      //bookmark_50
      const bookmarkId = parseInt(blurb.id.slice(9));
      const work = BackgroundWork.fromListingBlurb(workId, blurb);
      work.bookmarkId = bookmarkId;
      map.set(workId, work);
    }
    return map;
  }

  private async resolveConflicts(merger: Merger) {
    this.sendProgress('Resolving conflicts');
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
  }

  private async propagateChanges(
    local: WorkMap<PlainWork>,
    newLocal: WorkMap<PlainWork>
  ) {
    this.sendProgress('Propagating updates');
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
  }

  private async fetchMissingDirect(
    missingData: Set<number>,
    newLocal: WorkMap<PlainWork>
  ) {
    for (const [i, workId] of Array.from(missingData).entries()) {
      this.sendProgress('Fetching missing metadata', [i, missingData.size]);
      const updatedWork = await BackgroundWork.fetch(workId);
      updatedWork.assignRemote(newLocal.get(workId)!);
      newLocal.set(workId, classToPlain(updatedWork) as PlainWork);
    }
  }

  private sendProgress(text: string, subprogress?: [number, number]): void {
    let progress = `${text}...`;
    let overwrite = false;
    if (subprogress) {
      progress += ` (${subprogress[0]}/${subprogress[1]})`;
      overwrite = true;
    }
    this.logger.log(progress);
    void api.readingListSyncProgress.sendCS(
      this.sender.tab!.id!,
      this.sender.frameId!,
      progress,
      false,
      overwrite
    );
  }

  private async fetchCollectionData(): Promise<[WorkMap<RemoteWork>, number]> {
    const res = await safeFetch(
      `https://archiveofourown.org/collections/${this.options.readingListCollectionId}/profile`
    );
    const doc = await toDoc(res);
    const dataLink = doc.querySelector('#intro a[href="/ao3e-reading-list"]');
    this.logger.log(dataLink);
    if (!dataLink) return [new Map(), 0];
    const length = dataLink.outerHTML.length;
    const rawData = dataLink.title;
    const decoded = decode32768(rawData);
    const uncompressed = LZMA.decompress(decoded);
    const data = new Map(
      Array.from(workMapPlainParse<RemoteWork>(uncompressed)).map(
        ([workId, work]) => [workId, fromRemoteWork(work)]
      )
    );
    return [data, length];
  }

  private async uploadCollectionData(
    rawData: WorkMap<RemoteWork>
  ): Promise<number> {
    this.logger.log(rawData);
    const json = workMapPlainStringify(rawData);
    const compressed = LZMA.compress(json, 1);
    const encoded = encode32768(compressed);
    const strData = `<a href="/ao3e-reading-list" title="${encoded}"></a>|Data Hidden|`;

    const editRes = await safeFetch(
      `https://archiveofourown.org/collections/${this.options.readingListCollectionId}/edit`
    );
    const editDoc = await toDoc(editRes);
    const editForm = editDoc.querySelector('form.post.collection');
    if (!editForm)
      throw new SyncError(
        'Could not find collection edit form. Is your collection id set correctly?'
      );
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
    const error = submitDoc.querySelector('.error ul')?.innerText;
    if (error) {
      throw new SyncError(`Error while updating collection intro ${error}`);
    }
    return strData.length;
  }

  private bookmarkData(): URLSearchParams {
    const data = new URLSearchParams();
    const tags = [...this.BOOKMARK_TAGS];
    data.set('bookmark[tag_string]', tags.join(','));
    data.set('bookmark[collection_names]', '');
    data.set('bookmarker_notes', '');
    data.set(
      'bookmark[private]',
      this.options.readingListPrivateBookmarks ? '1' : '0'
    );
    data.set('bookmark[rec]', '0');
    data.set(
      'bookmark[pseud_id]',
      this.options.readingListPsued!.id.toString()
    );
    return data;
  }

  private async createBookmark(workId: number): Promise<number> {
    const data = this.bookmarkData();
    data.set('authenticity_token', await fetchToken());
    data.set('commit', 'Create');
    data.set('utf8', '✓');
    return this._createBookmark(workId, data);
  }

  private async _createBookmark(
    workId: number,
    data: URLSearchParams
  ): Promise<number> {
    const url = `https://archiveofourown.org/works/${workId}/bookmarks`;
    const res = await safeFetch(url, { method: 'post', body: data });
    const doc = await toDoc(res);
    const error = doc.querySelector<HTMLElement>('.error')?.innerText;
    if (error) {
      throw new SyncError(`Error while creating bookmark: ${error}`, url);
    }
    const resPaths = new URL(res.url).pathname.split('/');
    if (resPaths.length !== 3 || resPaths[1] !== 'bookmarks') {
      throw new SyncError(
        'Create bookmark did not redirect like we thought it would.'
      );
    }
    const bookmarkId = parseInt(resPaths[2]);
    return bookmarkId;
  }

  private async deleteBookmark(bookmarkId: number): Promise<void> {
    const data = new URLSearchParams([
      ['authenticity_token', await fetchToken()],
      ['_method', 'delete'],
    ]);
    const url = `https://archiveofourown.org/bookmarks/${bookmarkId}`;
    const res = await safeFetch(url, {
      method: 'post',
      body: data,
    });
    const doc = await toDoc(res);
    const error = doc.querySelector<HTMLElement>('.error')?.innerText;
    if (error) {
      throw new SyncError(`Error while deleting bookmark: ${error}`, url);
    }
    const resPaths = new URL(res.url).pathname.split('/');
    if (resPaths.length !== 4 || resPaths[3] !== 'bookmarks') {
      throw new SyncError(
        'Delete bookmark did not redirect like we thought it would.'
      );
    }
  }
}

api.readingListSync.addListener(async (_, sender) => {
  const syncer = new Syncer(sender!);
  await syncer.sync();
});
