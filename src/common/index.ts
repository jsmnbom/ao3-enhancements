import { createLogger } from './logger.ts'

export { api } from './api.ts'

export { cache } from './cache.ts'

export type { Cache } from './cache.ts'
export { ADDON_CLASS } from './constants.ts'
export * from './data.ts'
export { createLogger, logger, type Logger as BaseLogger } from './logger.ts'

export { options } from './options.ts'
export type { Options } from './options.ts'

export { toast } from './toast/toast.tsx'

export * from './utils.ts'

const manifest = browser.runtime.getManifest()
createLogger(`${manifest.short_name} v${manifest.version}`, 'display: inline-block; background-color: #e0005a; color: #ffffff; font-weight: bold; padding: 1px 3px; border-radius: 3px;').info()
