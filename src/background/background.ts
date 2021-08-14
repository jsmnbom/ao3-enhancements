import { logger as defaultLogger, migrateOptions } from '@/common';

import './menus';
import './list';
import './sync';

const logger = defaultLogger.child('BG');

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason == 'update') {
    // Changed to cache.workPagesChecked and has
    // other meaning so remove completely
    void browser.storage.local.remove('cache.kudosChecked');
  }

  migrateOptions().catch((e) => {
    logger.error(e);
  });
});
