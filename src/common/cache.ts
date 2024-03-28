import { jsonEqual } from 'trimerge'
import type { ValueOf } from 'type-fest'

import { createLogger } from './logger.js'
import { isPrimitive } from './utils.js'

const logger = createLogger('Cache')

interface Cache {
  // WorkId is string since we will be JSONing the data
  chapterDates: { [workId: string]: string[] }
}

// eslint-disable-next-line ts/no-namespace
export namespace cache {
  export const DEFAULT: Cache = {
    chapterDates: {},
  }

  export type Id = keyof Cache

  export async function get<K extends Id, R = ValueOf<Cache, K>>(id: K): Promise<R>
  export async function get<K extends Array<Id>, R = Pick<Cache, K[number]>>(ids: K): Promise<R>
  export async function get(ids: Id | Id[]): Promise<unknown> {
    const request = Object.fromEntries(
      (Array.isArray(ids) ? ids : [ids]).map((id: Id) => [
        `cache.${id}`,
        DEFAULT[id],
      ]),
    )

    let res
    try {
      res = await browser.storage.local.get(request)
    }
    catch (e) {
      logger.error(`Couldn't get: ${ids.toString()}`)
      throw e
    }

    const ret = Object.fromEntries(
      Object.entries(res).map(([rawId, value]: [string, unknown]) => {
        // remove 'cache.' from id
        const id: Id = rawId.substring(6) as Id
        const defaultValue = DEFAULT[id]
        if (!isPrimitive(defaultValue) && !jsonEqual(value, defaultValue))
          value = JSON.parse(<string>value) as unknown

        return [id, value]
      }),
    )

    logger.debug(ret)

    if (Array.isArray(ids))
      return ret
    else
      return ret[ids]
  }

  export async function set<T extends Partial<Cache>>(obj: T): Promise<void> {
    const set = Object.fromEntries(
      Object.entries(obj).map(([rawId, value]: [string, unknown]) => {
        const id = `cache.${rawId}`
        const defaultValue = DEFAULT[rawId as Id]
        if (!isPrimitive(defaultValue))
          value = JSON.stringify(value) as unknown

        return [id, value]
      }),
    )

    logger.debug('Setting:', set)

    try {
      await browser.storage.local.set(set)
    }
    catch (e) {
      logger.error(`Couldn't set: ${obj.toString()}`)
      throw e
    }
  }

  export async function migrate(): Promise<void> {
    // removed in 0.4.0
    await browser.storage.local.remove([
      'cache.kudosChecked',
      'cache.workPagesChecked',
      'cache.kudosGiven',
      'cache.bookmarked',
      'cache.subscribed',
    ])
  }
}
