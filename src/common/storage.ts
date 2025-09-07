import type { ValueOf } from 'type-fest'

import { notUndefined, objectMap, toArray } from '@antfu/utils'

import { createLogger } from './logger.ts'

export interface StorageDetails<Shape extends StorageShape> {
  area: StorageArea
  name: string
  prefix: string
  defaults: Shape
  ignoredEvents?: StorageId<Shape>[]
}

interface StorageShape {
  [key: string]: any
}

type StorageArea = 'local' | 'sync' | 'managed' | 'session'
type StorageId<Shape extends StorageShape> = keyof Shape & string
type StorageChange<Shape extends StorageShape> = Partial<Shape>
type StorageListener<Shape extends StorageShape> = (changes: StorageChange<Shape>) => void

const onChanged = browser.storage.onChanged

export function createStorage<Shape extends StorageShape>(details: StorageDetails<Shape>) {
  const { area, name, prefix, defaults, ignoredEvents = [] } = details
  const logger = createLogger(name)
  const listeners = new Set<StorageListener<Shape>>()

  const storage = {
    ...details,
    get,
    set,
    addListener(this: void, listener: StorageListener<Shape>) {
      listeners.add(listener)
      updateListener()
    },
    removeListener(this: void, listener: StorageListener<Shape>) {
      listeners.delete(listener)
      updateListener()
    },
    hasListener(this: void, listener: StorageListener<Shape>) {
      return listeners.has(listener)
    },
  }

  return storage

  async function get<K extends StorageId<Shape>>(id: K): Promise<ValueOf<Shape, K>>
  async function get<K extends Array<StorageId<Shape>>>(ids: K): Promise<Pick<Shape, K[number]>>
  async function get(): Promise<Shape>
  async function get(ids?: StorageId<Shape> | StorageId<Shape>[]): Promise<unknown> {
    // Turn into array of prefixed keys
    const request = toArray(ids ?? Object.keys(defaults)).map(id => `${prefix}${id}`)

    const rawResponse = await browser.storage[area].get(request)

    // Map back to the original key names, and apply defaults
    const response = request.map((key) => {
      const id = key.substring(prefix.length) as StorageId<Shape>
      return [id, rawResponse[key] ?? defaults[id]] as [StorageId<Shape>, unknown]
    })

    logger.debug(response)

    return (ids === undefined || Array.isArray(ids)) ? Object.fromEntries(response) : response[0]![1]
  }

  async function set<T extends Partial<Shape>>(obj: T): Promise<void> {
    const items = objectMap(obj, (id, value) => [`${prefix}${id}`, value])
    logger.debug('Setting:', items)
    await browser.storage.local.set(items)
  }

  function listener(changes: { [key: string]: browser.storage.StorageChange }, areaName: string) {
    if (areaName !== 'local')
      return

    const keys = Object.keys(changes).filter(key => key.startsWith(prefix))

    if (!keys.length)
      return

    const entries = keys.map((key) => {
      const id = key.slice(prefix.length) as StorageId<Shape>
      return ignoredEvents.includes(id) ? undefined : [id, changes[key]!.newValue] as [StorageId<Shape>, unknown]
    }).filter(notUndefined)

    if (entries.length) {
      logger.debug('Change:', entries)
      const change = Object.fromEntries(entries) as StorageChange<Shape>
      listeners.forEach(l => l(change))
    }
  }

  function updateListener() {
    if (listeners.size === 0 && onChanged.hasListener(listener))
      onChanged.removeListener(listener)
    else if (!onChanged.hasListener(listener))
      onChanged.addListener(listener)
  }
}
