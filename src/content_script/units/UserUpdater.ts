import compare from 'just-compare';

import { log, getUser, setOptions } from '@/common';
import Unit from '@/content_script/Unit';

export class UserUpdater extends Unit {
  get enabled(): boolean {
    return true;
  }

  async ready(): Promise<void> {
    const user = getUser(document);
    if (!compare(user, this.options.user)) {
      log(
        `Logged in user ${JSON.stringify(
          user
        )} did not match stored ${JSON.stringify(
          this.options.user
        )}. Updating...`
      );
      await setOptions({ user });
    }
  }
}
