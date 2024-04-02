import { isDeepEqual } from '@antfu/utils'

import { Unit, getUser, options } from '#common'

// Make sure this only runs once
let hasUpdated = false

export class UserUpdater extends Unit {
  get enabled(): boolean {
    return !hasUpdated
  }

  async ready(): Promise<void> {
    const user = getUser(document)
    if (!isDeepEqual(user, this.options.user)) {
      this.logger.warn(
        `Logged in user ${JSON.stringify(
          user,
        )} did not match stored ${JSON.stringify(this.options.user)}.`,
      )
      await options.set({ user })
      hasUpdated = true
    }
  }
}
