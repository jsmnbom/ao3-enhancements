import compare from 'just-compare';

import { error, groupCollapsed, groupEnd, isPrimitive, log } from '@/common';

export const defaultCache = {
  // WorkId is string since we will be JSONing the data
  chapterDates: {} as { [workId: string]: string[] },
};

export const cacheIds = Object.fromEntries(
  Object.keys(defaultCache).map((key) => [key, key])
) as Record<keyof typeof defaultCache, keyof typeof defaultCache>;

export type CacheId = keyof typeof defaultCache;
export type Cache = typeof defaultCache;

export async function getCache<
  DO extends typeof defaultCache,
  T extends keyof DO,
  R extends DO[T]
>(id: T): Promise<R> {
  const cacheId = `cache.${id}`;
  const defaultValue = <R>(defaultCache as DO)[id];
  return await browser.storage.local
    .get({ [cacheId]: defaultValue })
    .then((obj) => {
      let value = obj[cacheId];
      if (!isPrimitive(defaultValue) && !compare(value, defaultValue)) {
        groupCollapsed(cacheId, 'value is not primitive! Dejsonning.');
        log(value);
        groupEnd();
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
  DO extends typeof defaultCache,
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
