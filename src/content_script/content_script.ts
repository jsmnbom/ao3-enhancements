import debounce from 'just-debounce-it';

import { logger } from '@/common/logger';
import { options } from '@/common/options';
import { api } from '@/common/api';

import { ADDON_CLASS, addThemeClass, getTag, ready } from './utils';
import Units from './units';
import Unit from './Unit';

/**
 * Clears any old DOM elements added by the extension.
 */
async function clean(units: Unit[]) {
  addThemeClass(true);
  for (const unit of units) {
    await unit.clean();
  }
  const toRemove = document.querySelectorAll(`.${ADDON_CLASS}`);
  if (toRemove) {
    logger.debug('Removing old elements: ', toRemove);
    for (const el of toRemove) {
      el.remove();
    }
  }
}

async function run() {
  const _options = await options.get(options.ALL);
  logger.verbose = _options.verbose;
  const units = Units.map((U) => new U(_options));
  await ready();
  logger.debug('Ready!');
  const enabledUnits = units.filter((u) => u.enabled);
  logger.info(
    'Enabled units:',
    enabledUnits.map((u) => u.constructor.name)
  );
  await clean(units);
  addThemeClass();
  for (const unit of enabledUnits) {
    await unit.ready();
  }
}

run().catch((err) => {
  logger.error(err);
});

const debouncedRun = debounce(run, 500) as unknown as typeof run;

browser.storage.onChanged.addListener((changes, areaName) => {
  if (
    areaName === 'local' &&
    Object.keys(changes).some((key) => key.startsWith('option.'))
  ) {
    logger.info('Options have changed, reloading.');
    // TODO: Catch working here??
    debouncedRun().catch((err) => {
      logger.error(err);
    });
  }
});

api.getTag.addListener(async (linkUrl) => {
  return getTag(linkUrl);
});
