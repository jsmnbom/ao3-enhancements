import compare from 'just-compare';

import Unit from '@/content_script/Unit';
import { getUser } from '@/common/utils';
import { options } from '@/common/options';

// Make sure this only runs once
let hasUpdated = false;

export class UserUpdater extends Unit {
  get enabled(): boolean {
    return !hasUpdated;
  }

  async ready(): Promise<void> {
    const user = getUser(document);
    if (!compare(user, this.options.user)) {
      this.logger.warn(
        `Logged in user ${JSON.stringify(
          user
        )} did not match stored ${JSON.stringify(this.options.user)}.`
      );
      await options.set({ user: user });
      hasUpdated = true;
    }
  }
}
