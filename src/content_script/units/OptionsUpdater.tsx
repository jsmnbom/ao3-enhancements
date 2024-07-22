import { options, parseUser } from '#common'
import { Unit } from '#content_script/Unit.js'

import { isDarkTheme } from '../utils.tsx'

export class OptionsUpdater extends Unit {
  // Make sure this only runs once
  static hasUpdated = false

  get name() { return 'OptionsUpdater' }
  get enabled() { return !OptionsUpdater.hasUpdated }

  async ready(): Promise<void> {
    const theme = isDarkTheme() ? 'dark' : 'light'
    if (theme !== this.options.theme.current) {
      this.logger.warn(
        `Current theme ${theme} did not match stored ${this.options.theme.current}.`,
      )
      this.options.theme.current = theme
      await options.set({ theme: this.options.theme })
      OptionsUpdater.hasUpdated = true
    }

    const user = parseUser(document)
    if (user && user.userId !== this.options.user?.userId) {
      this.logger.warn(`Current user ${user.userId} did not match stored ${this.options.user?.userId}.`)
      this.options.user = user
      await options.set({ user: this.options.user })
      OptionsUpdater.hasUpdated = true
    }
  }
}
