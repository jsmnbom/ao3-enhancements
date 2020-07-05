/* eslint-disable @typescript-eslint/no-empty-function */
import { Options, logger } from '@/common';

export default class Unit {
  logger = logger.unit(this);

  constructor(public options: Options) {}

  get enabled(): boolean {
    return false;
  }

  async clean(): Promise<void> {}

  async beforeReady(): Promise<void> {}

  async ready(): Promise<void> {}
}
