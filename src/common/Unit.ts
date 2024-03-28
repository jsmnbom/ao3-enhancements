import { logger } from './logger.js'
import type { Options } from './options.js'

export class Unit {
  logger = logger.unit(this)

  constructor(public options: Options) {}

  get enabled(): boolean {
    return false
  }

  async clean(): Promise<void> {}

  async ready(): Promise<void> {}
}
