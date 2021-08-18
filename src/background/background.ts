import { childLogger } from '@/common/logger';
import { options } from '@/common/options';
import { cache } from '@/common/cache';

import './menus';
import './list';
import './sync';

const logger = childLogger('BG');

browser.runtime.onInstalled.addListener((_details) => {
  options.migrate().catch((e) => {
    logger.error(e);
  });

  cache.migrate().catch((e) => {
    logger.error(e);
  });
});
