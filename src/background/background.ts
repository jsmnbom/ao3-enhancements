import { api, cache, createLogger, options } from '#common'

const logger = createLogger('BG')

// Firefox for android has no contextMenus support
if (browser.contextMenus)
  import('./menus.ts').catch(e => logger.error(e))

browser.runtime.onInstalled.addListener((details) => {
  options.migrate(details).catch((e) => {
    logger.error(e)
  })

  cache.migrate(details).catch((e) => {
    logger.error(e)
  })

  void browser.runtime.openOptionsPage()
})

api.openOptionsPage.addListener(async () => {
  await browser.runtime.openOptionsPage()
})
