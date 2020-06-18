import compare from 'just-compare';

import {
  OptionId,
  Options,
  defaultOptions,
  error,
  groupCollapsed,
  groupEnd,
  isPrimitive,
  log,
  optionIds,
} from '@/common';
import { ADDON_CLASS, ready } from './utils';
import { HideWorks, Stats, StyleTweaks, Tools } from './units';
import Unit from './Unit';

const Units = [StyleTweaks, HideWorks, Tools, Stats];

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

export async function waitForOptions(): Promise<Options> {
  const keys: { [key: string]: unknown } = Object.fromEntries(
    Object.keys(optionIds).map((key) => [
      `option.${key}`,
      defaultOptions[key as OptionId],
    ])
  );
  const rawOptions = await browser.storage.local.get(keys);
  const options: { [key: string]: unknown } = {};
  for (const rawKey of Object.keys(rawOptions)) {
    const key = rawKey.substring(7);
    // Remove option. to find default
    const defaultValue = defaultOptions[key as OptionId];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = rawOptions[rawKey];
    if (!isPrimitive(defaultValue) && !compare(value, defaultValue)) {
      groupCollapsed(key, 'value is not primitive! Dejsonning.');
      log(value);
      groupEnd();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      options[key] = JSON.parse(value);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      options[key] = value;
    }
  }
  log('Using options:', options);
  return <Options>options;
}

async function run() {
  const options = await waitForOptions();
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
