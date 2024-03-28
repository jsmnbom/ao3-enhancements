import { cache, createLogger, options } from '#common'

const logger = createLogger('BG')

// Firefox for android has no contextMenus support
if (browser.contextMenus)
  import('./menus').catch(e => logger.error(e))

browser.runtime.onInstalled.addListener((_details) => {
  options.migrate().catch((e) => {
    logger.error(e)
  })

  cache.migrate().catch((e) => {
    logger.error(e)
  })
})
