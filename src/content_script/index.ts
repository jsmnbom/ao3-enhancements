import { error, log, getOptions, ALL_OPTIONS } from '@/common';
import { ADDON_CLASS, ready } from './utils';
import Units from './units';
import Unit from './Unit';

/**
 * Clears any old DOM elements added by the extension. Needed
 */
async function clean(units: Unit[]) {
  for (const unit of units) {
    await unit.clean();
  }
  const toRemove = document.querySelectorAll(`.${ADDON_CLASS}`);
  if (toRemove) {
    log('Removing old elements: ', toRemove);
    for (const el of toRemove) {
      el.remove();
    }
  }
}

async function run() {
  const options = await getOptions(ALL_OPTIONS);
  const units = Units.map((U) => new U(options));
  const enabledUnits = units.filter((u) => u.enabled);
  log(
    'Enabled units:',
    enabledUnits.map((u) => u.constructor.name)
  );

  await clean(units);
  for (const unit of enabledUnits) {
    await unit.beforeReady();
  }
  await ready();
  log('Ready!');
  for (const unit of enabledUnits) {
    await unit.ready();
  }
}

run().catch((err) => {
  error(err);
});

browser.storage.onChanged.addListener((changes, areaName) => {
  if (
    areaName === 'local' &&
    Object.keys(changes).some((key) => key.startsWith('option.'))
  ) {
    log('Storage options changed');
    run().catch((err) => {
      error(err);
    });
  }
});
