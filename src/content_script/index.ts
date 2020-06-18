// @ts-ignore
import compare from 'just-compare';

import {
  log,
  error,
  defaultOptions,
  Options,
  optionIds,
  OptionId,
  isPrimitive,
} from '@/common';
import { ADDON_CLASS } from './scripts/utils';
import { addToolsDropdown } from './scripts/toolsDropdown';
import { addStats, cleanStats } from './scripts/stats';
import { hideWorks, cleanHidden } from './scripts/hideWorks';
import { styleTweaks } from './scripts/styleTweaks';

/**
 * Calls cb when page is ready
 */
function ready(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState != 'loading') {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', (e) => resolve());
    }
  });
}

/**
 * Clears any old DOM elements added by the extension. Needed
 */
function clearOld() {
  cleanHidden();
  cleanStats();
  const toRemove = document.querySelectorAll(`.${ADDON_CLASS}`);
  if (toRemove) {
    log('Removing old elements: ', toRemove);
    for (const el of toRemove) {
      const sibling = el.nextSibling;
      if (sibling && sibling.nodeType === 3 && !/\S/.test(sibling.nodeValue!)) {
        sibling.remove();
      }
      el.remove();
    }
  }
}

export async function waitForOptions(): Promise<Options> {
  const keys: any = Object.fromEntries(
    Object.keys(optionIds).map((key) => [
      `option.${key}`,
      defaultOptions[key as OptionId],
    ])
  );
  const rawOptions = await browser.storage.local.get(keys);
  const options: any = {};
  for (const rawKey of Object.keys(rawOptions)) {
    const key = rawKey.substring(7);
    // Remove option. to find default
    const defaultValue = defaultOptions[key as OptionId];
    const value = rawOptions[rawKey];
    if (!isPrimitive(defaultValue) && !compare(value, defaultValue)) {
      log(key, value, 'is not primitive! Dejsonning.');
      options[key] = JSON.parse(value);
    } else {
      options[key] = value;
    }
  }
  log('Using options:', options);
  return <Options>options;
}

async function run() {
  const options = await waitForOptions();
  clearOld();
  styleTweaks(options);
  await ready();
  log('Ready!');
  addToolsDropdown();
  hideWorks(options);
  await addStats(options);
}

run().catch((err) => {
  error(err);
});

browser.storage.onChanged.addListener(async (changes, areaName) => {
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
