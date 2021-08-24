import { createLogger } from '@/common/logger';
import { options } from '@/common/options';
import { cache } from '@/common/cache';

import './list';
import './sync';

const logger = createLogger('BG');

// Firefox for android has no contextMenus support
if (browser.contextMenus) {
  import('./menus').catch((e) => logger.error(e));
}

browser.runtime.onInstalled.addListener((_details) => {
  options.migrate().catch((e) => {
    logger.error(e);
  });

  cache.migrate().catch((e) => {
    logger.error(e);
  });
});
