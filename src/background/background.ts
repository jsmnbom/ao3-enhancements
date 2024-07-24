import { api, cache, createLogger, options } from '#common'

const logger = createLogger('BG')

// Firefox for android has no contextMenus support
if (browser.contextMenus)
  import('./menus.ts').catch(e => logger.error(e))

browser.runtime.onInstalled.addListener(async () => {
  // Run migrations when we install or update extension
  await runMigrations()
})

api.openOptionsPage.addListener(async () => {
  await browser.runtime.openOptionsPage()
})

async function runMigrations() {
  await import('./migrations.ts').then(({ migrate }) => migrate())
}

if (process.env.NODE_ENV === 'development') {
  // Allow manual testing access to the option and cache object
  ;(globalThis as any).options = options
  ;(globalThis as any).cache = cache
}
