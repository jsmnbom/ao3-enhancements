/* eslint-disable @typescript-eslint/no-empty-function */
import { logger } from '@/common/logger';
import { Options } from '@/common/options';

export default class Unit {
  logger = logger.unit(this);

  constructor(public options: Options) {}

  get enabled(): boolean {
    return false;
  }

  async clean(): Promise<void> {}

  async ready(): Promise<void> {}
}
