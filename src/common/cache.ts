import compare from 'just-compare';

import { isPrimitive } from '@/common';

import defaultLogger from './logger';

const logger = defaultLogger.child('Cache');

interface Cache {
  // WorkId is string since we will be JSONing the data
  chapterDates: { [workId: string]: string[] };

  workPagesChecked: number[];
  kudosGiven: number[];
  bookmarked: number[];
  subscribed: number[];
}

export const DEFAULT_CACHE: Cache = {
  chapterDates: {},

  workPagesChecked: [],
  kudosGiven: [],
  bookmarked: [],
  subscribed: [],
};

export type CacheId = keyof Cache;

export async function getCache<K extends CacheId, R = ValueOf<Cache, K>>(
  id: K
): Promise<R>;
export async function getCache<
  K extends Array<CacheId>,
  R = Pick<Cache, K[number]>
>(ids: K): Promise<R>;
export async function getCache(ids: CacheId | CacheId[]): Promise<unknown> {
  const request = Object.fromEntries(
    (Array.isArray(ids) ? ids : [ids]).map((id: CacheId) => [
      `cache.${id}`,
      DEFAULT_CACHE[id],
    ])
  );

  let res;
  try {
    res = await browser.storage.local.get(request);
  } catch (e) {
    logger.error(`Couldn't get: ${ids}`);
    throw e;
  }

  const ret = Object.fromEntries(
    Object.entries(res).map(([rawId, value]: [string, unknown]) => {
      // remove 'cache.' from id
      const id: CacheId = rawId.substring(6) as CacheId;
      const defaultValue = DEFAULT_CACHE[id];
      if (!isPrimitive(defaultValue) && !compare(value, defaultValue)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value = JSON.parse(<string>value) as unknown;
      }
      return [id, value];
    })
  );

  logger.debug(ret);

  if (Array.isArray(ids)) {
    return ret;
  } else {
    return ret[ids];
  }
}

export async function setCache<T extends Partial<Cache>>(
  obj: T
): Promise<void> {
  const set = Object.fromEntries(
    Object.entries(obj).map(([rawId, value]: [string, unknown]) => {
      const id = `cache.${rawId}`;
      const defaultValue = DEFAULT_CACHE[rawId as CacheId];
      if (!isPrimitive(defaultValue)) {
        value = JSON.stringify(value) as unknown;
      }
      return [id, value];
    })
  );

  logger.debug('Setting:', set);

  try {
    await browser.storage.local.set(set);
  } catch (e) {
    logger.error(`Couldn't set: ${obj}`);
    throw e;
  }
}
