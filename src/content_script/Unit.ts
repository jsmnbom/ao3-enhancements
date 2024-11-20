import type { BaseLogger, Options } from '#common'

import { logger } from '#common'

export class Unit {
  logger: BaseLogger

  constructor(public options: Options) {
    this.logger = logger.child(this.name)
  }

  get name(): string { return 'Unit' }
  get enabled(): boolean { return false }

  async clean(): Promise<void> {}

  async ready(): Promise<void> {}
}
