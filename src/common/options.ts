import type { AuthorFilter, Language, TagFilter } from './data.ts'
import { createStorage } from './storage.ts'

export interface ThemeOption {
  chosen: 'inherit' | 'dark' | 'light'
  current: 'dark' | 'light'
}

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
  hideCrossovers: { enabled: boolean, maxFandoms: number }
  hideLanguages: { enabled: boolean, show: Language[] }
  hideAuthors: { enabled: boolean, filters: AuthorFilter[] }
  hideTags: { enabled: boolean, filters: TagFilter[] }

  styleWidthEnabled: boolean
  styleWidth: number
  showStatsColumns: boolean

  theme: ThemeOption
  user: { userId?: string }

  // Special case - see ./logger.ts
  verbose: boolean
}

export type Id = keyof Options
export type BooleanId = keyof Pick<Options, { [K in keyof Options]: Options[K] extends boolean ? K : never }[keyof Options]>
export type NumberId = keyof Pick<Options, { [K in keyof Options]: Options[K] extends number ? K : never }[keyof Options]>

export const { get, set, addListener, hasListener, migrate, removeListener, defaults } = createStorage<Options>({
  area: 'local',
  name: 'Options',
  prefix: 'option.',
  ignoredEvents: ['theme', 'user'],
  defaults: {
    showTotalTime: true,
    showTotalFinish: true,
    showChapterWords: true,
    showChapterTime: true,
    showChapterFinish: true,
    showChapterDate: true,
    wordsPerMinute: 200,
    showKudosHitsRatio: true,

    hideShowReason: true,
    hideCrossovers: { enabled: true, maxFandoms: 7 },
    hideLanguages: { enabled: false, show: [] },
    hideAuthors: { enabled: false, filters: [] },
    hideTags: { enabled: false, filters: [] },

    styleWidthEnabled: true,
    styleWidth: 40,
    showStatsColumns: true,

    theme: { chosen: 'inherit', current: 'light' },
    user: { },

    verbose: false,
  },
  migrator: process.env.CONTEXT === 'background'
    ? async (details) => {
      const { version, prefix, defaults, logger } = details
      const migrationFrom: Record<string, any> = {}
      const migrationTo: Record<string, any> = {}

      if (version === '0.5.0') {
      // No longer booleans
        const noLongerBooleans = ['hideCrossovers', 'hideLanguages', 'hideAuthors', 'hideTags']
        for (const id of noLongerBooleans) {
          const key = `${prefix}${id}` as Id
          const { [key]: val } = await browser.storage.local.get(key)
          if (typeof val === 'boolean') {
            migrationFrom[key] = val
            migrationTo[key] = defaults[key]
          }
        }
        // No longer jsonning
        const noLongerJsonning = ['theme', 'user', 'hideCrossovers', 'hideLanguages', 'hideAuthors', 'hideTags']
        for (const id of noLongerJsonning) {
          const key = `${prefix}${id}` as Id
          const { [key]: val } = await browser.storage.local.get(key)
          if (typeof val === 'string') {
            migrationFrom[key] = val
            migrationTo[key] = JSON.parse(val) as unknown ?? defaults[key]
          }
        }
      }

      if (Object.keys(migrationFrom).length > 0) {
        logger.info('Migrating from:', migrationFrom)
        logger.info('Migrating to:', migrationTo)

        await browser.storage.local.set(migrationTo)
      }
    }
    : undefined,
})
