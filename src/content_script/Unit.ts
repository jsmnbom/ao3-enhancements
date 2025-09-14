import type { BaseLogger, Options } from '#common'

import { logger } from '#common'

export class Unit {
  constructor(public options: Options) {
  }

  static get logger(): BaseLogger { return logger.child(this.name) }
  get logger(): BaseLogger { return (this.constructor as typeof Unit).logger }
  static get name(): string { return 'Unit' }
  get name(): string { return (this.constructor as typeof Unit).name }

  static async clean(): Promise<void> {}

  get enabled(): boolean { return false }
  async ready(): Promise<void> {}
}
