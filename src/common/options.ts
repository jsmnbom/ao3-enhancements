import { jsonEqual } from 'trimerge'
import type { ValueOf } from 'type-fest'

import { createLogger } from './logger.js'
import { clone, isPrimitive } from './utils.js'

const logger = createLogger('Options')

interface Item { text: string, value: string }

export interface Tag { tag: string, type: TagType }

export const tagTypes = [
  'fandom',
  'warning',
  'category',
  'relationship',
  'character',
  'freeform',
  'unknown',
] as const

export type TagType = typeof tagTypes[number]

export const READ_DATE_RESOLUTIONS = ['day', 'boolean'] as const

export type ReadDateResolution = typeof READ_DATE_RESOLUTIONS[number]

export interface User {
  username: string
  imgSrc: string
  imgAlt: string
}

export interface Theme {
  chosen: 'inherit' | 'dark' | 'light'
  current: 'dark' | 'light'
}

export type StyleAlign = 'start' | 'end' | 'center' | 'justified'
export interface Options {
  showTotalTime: boolean
  showTotalFinish: boolean
  showChapterWords: boolean
  showChapterTime: boolean
  showChapterFinish: boolean
  showChapterDate: boolean
  wordsPerMinute: number
  showKudosHitsRatio: boolean

  hideShowReason: boolean
  hideCrossovers: boolean
  hideCrossoversMaxFandoms: number
  hideLanguages: boolean
  hideLanguagesList: Item[]
  hideAuthors: boolean
  hideAuthorsList: string[]
  hideTags: boolean
  // hideTagsDenyList: string[];
  // hideTagsAllowList: string[];
  hideTagsDenyList: Tag[]
  hideTagsAllowList: Tag[]

  styleWidthEnabled: boolean
  styleWidth: number
  showStatsColumns: boolean
  styleAlignEnabled: boolean
  styleAlign: StyleAlign

  readingListPsued: { name: string, id: number } | null
  readingListCollectionId: string | null
  readingListReadDateResolution: ReadDateResolution
  readingListPrivateBookmarks: boolean
  readingListShowNeverReadInListings: boolean
  readingListAutoRead: boolean
  readingListShowButton: 'never' | 'always' | 'exceptWhenReading'

  user: User | null

  theme: Theme

  verbose: boolean
}

// eslint-disable-next-line ts/no-namespace
export namespace options {
  export const DEFAULT: Options = {
    showTotalTime: true,
    showTotalFinish: true,
    showChapterWords: true,
    showChapterTime: true,
    showChapterFinish: true,
    showChapterDate: true,
    wordsPerMinute: 200,
    showKudosHitsRatio: true,

    hideShowReason: true,
    hideCrossovers: false,
    hideCrossoversMaxFandoms: 4,
    hideLanguages: false,
    hideLanguagesList: [],
    hideAuthors: false,
    hideAuthorsList: [],
    hideTags: false,
    hideTagsDenyList: [],
    hideTagsAllowList: [],

    styleWidthEnabled: false,
    styleWidth: 40,
    showStatsColumns: true,
    styleAlignEnabled: false,
    styleAlign: 'start',

    readingListPsued: null,
    readingListCollectionId: null,
    readingListReadDateResolution: 'day',
    readingListPrivateBookmarks: true,
    readingListShowNeverReadInListings: true,
    readingListAutoRead: false,
    readingListShowButton: 'exceptWhenReading',

    user: null,

    theme: { chosen: 'inherit', current: 'light' },

    verbose: false,
  }

  export type Id = keyof Options

  export const ALL = Object.keys(DEFAULT) as Id[]
  export const IDS = Object.fromEntries(Object.keys(DEFAULT).map(key => [key, key])) as Record<Id, Id>

  export async function get<K extends Id, R = ValueOf<Options, K>>(id: K): Promise<R>
  export async function get<K extends Array<Id>, R = Pick<Options, K[number]>>(ids: K): Promise<R>
  export async function get(ids: Id | Id[]): Promise<unknown> {
    const def = clone(DEFAULT)
    const request = Object.fromEntries(
      (Array.isArray(ids) ? ids : [ids]).map((id: Id) => [
        `option.${id}`,
        def[id],
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
        // remove 'option.' from id
        const id = rawId.substring(7) as Id
        const defaultValue = DEFAULT[id]
        if (!isPrimitive(defaultValue) && !jsonEqual(value, defaultValue))
          value = JSON.parse(<string>value) as unknown

        return [id, value]
      }),
    )

    logger.debugAlways(ret)

    if (Array.isArray(ids))
      return ret
    else
      return ret[ids]
  }

  export async function set<T extends Partial<Options>>(obj: T): Promise<void> {
    const set = Object.fromEntries(
      Object.entries(obj).map(([rawId, value]: [string, unknown]) => {
        const id = `option.${rawId}`
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
    // string[] to Tag[]
    for (const rawKey of ['hideTagsDenyList', 'hideTagsAllowList']) {
      const key = `option.${rawKey}`
      const obj: Record<typeof key, string | null> = await browser.storage.local.get(key)

      if (obj && obj[key]) {
        const val = JSON.parse(obj[key]!) as string[] | Tag[]
        if (val.length > 0 && typeof val[0] === 'string') {
          const newVal = (val as string[]).map(x => ({
            tag: x,
            type: 'unknown',
          }))

          logger.log(`Migrating ${key}. Old: ${val.toString()} New: ${newVal.toString()}`)
          await browser.storage.local.set({ [key]: JSON.stringify(newVal) })
        }
      }
    }
  }
}
