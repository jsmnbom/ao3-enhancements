import { logger } from './logger.ts'
import type { Options } from './options.ts'

export class Unit {
  logger = logger.unit(this)

  constructor(public options: Options) {}

  get enabled(): boolean {
    return false
  }

  async clean(): Promise<void> {}

  async ready(): Promise<void> {}
}
