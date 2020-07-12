import compare from 'just-compare';

import { getUser } from '@/common';
import Unit from '@/content_script/Unit';

export class UserUpdater extends Unit {
  get enabled(): boolean {
    return true;
  }

  async ready(): Promise<void> {
    const user = getUser(document);
    if (!compare(user, this.options.user)) {
      this.logger.warn(
        `Logged in user ${JSON.stringify(
          user
        )} did not match stored ${JSON.stringify(this.options.user)}.`
      );
      //await setOptions({ user });
    }
  }
}
