import compare from 'just-compare';

import { isPrimitive } from './utils';
import { childLogger } from './logger';

const logger = childLogger('Cache');

// TODO: Clean old (non compliant) cache entries

interface Cache {
  // WorkId is string since we will be JSONing the data
  chapterDates: { [workId: string]: string[] };
}

export type Id = keyof Cache;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace cache {
  export const DEFAULT: Cache = {
    chapterDates: {},
  };

  export async function get<K extends Id, R = ValueOf<Cache, K>>(
    id: K
  ): Promise<R>;
  export async function get<K extends Array<Id>, R = Pick<Cache, K[number]>>(
    ids: K
  ): Promise<R>;
  export async function get(ids: Id | Id[]): Promise<unknown> {
    const request = Object.fromEntries(
      (Array.isArray(ids) ? ids : [ids]).map((id: Id) => [
        `cache.${id}`,
        DEFAULT[id],
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
        const id: Id = rawId.substring(6) as Id;
        const defaultValue = DEFAULT[id];
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

  export async function set<T extends Partial<Cache>>(obj: T): Promise<void> {
    const set = Object.fromEntries(
      Object.entries(obj).map(([rawId, value]: [string, unknown]) => {
        const id = `cache.${rawId}`;
        const defaultValue = DEFAULT[rawId as Id];
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
}
