import { createStorage } from './storage.ts'

export interface Cache {
  // WorkId is string since we will be JSONing the data
  chapterDates: { [workId: string]: string[] }
}

export type Id = keyof Cache

export const { get, set, addListener, hasListener, migrate, removeListener } = createStorage({
  area: 'local',
  name: 'Cache',
  prefix: 'cache.',
  defaults: {
    chapterDates: {},
  },
  migrator: process.env.CONTEXT === 'background'
    ? async () => {
    // removed in 0.4.0
      await browser.storage.local.remove([
        'cache.kudosChecked',
        'cache.workPagesChecked',
        'cache.kudosGiven',
        'cache.bookmarked',
        'cache.subscribed',
      ])
    }
    : undefined,
})
