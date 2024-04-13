import { Unit, options } from '#common'

import { isDarkTheme } from '../utils.tsx'

// Make sure this only runs once
let hasUpdated = false

export class ThemeUpdater extends Unit {
  get enabled(): boolean {
    return !hasUpdated
  }

  async ready(): Promise<void> {
    const theme = isDarkTheme() ? 'dark' : 'light'
    if (theme !== this.options.theme.current) {
      this.logger.warn(
        `Current theme ${theme} did not match stored ${this.options.theme.current}.`,
      )
      this.options.theme.current = theme
      await options.set({ theme: this.options.theme })
      hasUpdated = true
    }
  }
}
