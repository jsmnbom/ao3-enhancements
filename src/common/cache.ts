import { createStorage } from './storage.ts'

export interface Cache {
  chapterDates: { [workId: string]: string[] }
}

export const cache = createStorage<Cache>({
  area: 'local',
  name: 'Cache',
  prefix: 'cache.',
  defaults: {
    chapterDates: {},
  },
})

// eslint-disable-next-line ts/no-namespace, ts/no-redeclare
export namespace cache {
  export type Id = keyof Cache
}
