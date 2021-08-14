import { childLogger } from '@/common/logger';
import { options } from '@/common/options';

import './menus';
import './list';
import './sync';

const logger = childLogger('BG');

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason == 'update') {
    // Changed to cache.workPagesChecked and has
    // other meaning so remove completely
    void browser.storage.local.remove('cache.kudosChecked');
  }

  options.migrate().catch((e) => {
    logger.error(e);
  });
});
