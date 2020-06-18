import { Options } from '@/common';

export default class Unit {
  constructor(public options: Options) {}

  get enabled(): boolean {
    return false;
  }

  async clean(): Promise<void> {}

  async beforeReady(): Promise<void> {}

  async ready(): Promise<void> {}
}
