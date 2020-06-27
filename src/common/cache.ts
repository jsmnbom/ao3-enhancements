import compare from 'just-compare';

import { error, groupCollapsed, groupEnd, isPrimitive, log } from '@/common';

interface Cache {
  // WorkId is string since we will be JSONing the data
  chapterDates: { [workId: string]: string[] };

  kudosChecked: number[];
  kudosGiven: number[];
}

export const DEFAULT_CACHE: Cache = {
  chapterDates: {},

  kudosChecked: [],
  kudosGiven: [],
};

export type CacheId = keyof Cache;

export const CACHE_IDS = Object.fromEntries(
  Object.keys(DEFAULT_CACHE).map((key) => [key, key])
) as Record<CacheId, CacheId>;

export async function getCache<T extends CacheId, R extends Cache[T]>(
  id: T
): Promise<R> {
  const cacheId = `cache.${id}`;
  const defaultValue = <R>DEFAULT_CACHE[id];
  return await browser.storage.local
    .get({ [cacheId]: defaultValue })
    .then((obj) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let value = obj[cacheId];
      if (!isPrimitive(defaultValue) && !compare(value, defaultValue)) {
        groupCollapsed(cacheId, 'value is not primitive! Dejsonning.');
        log(value);
        groupEnd();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value = JSON.parse(value);
      }
      return <R>value;
    })
    .catch((err) => {
      error(
        `Could not read ${cacheId} from storage. Setting to default ${defaultValue}.`,
        err
      );
      return defaultValue;
    });
}

export async function setCache<
  DO extends typeof DEFAULT_CACHE,
  T extends keyof DO,
  R extends DO[T]
>(id: T, value: R): Promise<void> {
  const cacheId = `cache.${id}`;
  if (!isPrimitive(value)) {
    log(cacheId, value, 'is not primitive! Jsonning.');
    value = (JSON.stringify(value) as unknown) as R;
  }
  log(`Setting ${id} to ${value}.`);
  await browser.storage.local
    .set({ [cacheId]: value })
    .catch((err) => {
      error(`Could not set ${cacheId} with value ${value} to storage.`, err);
    });
}
