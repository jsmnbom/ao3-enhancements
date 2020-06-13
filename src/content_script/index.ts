// @ts-ignore
import compare from 'just-compare';

import {
  log,
  error,
  ADDON_CLASS,
  defaultOptions,
  Options,
  optionIds,
  OptionId,
  isPrimitive,
} from '@/common';
import { addOptionsButton } from './scripts/optionsButton';
import { addTime } from './scripts/time';
import { addKudosHitRatio } from './scripts/kudosHitsRatio';
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
  addOptionsButton();
  hideWorks(options);
  addTime(options);
  addKudosHitRatio(options);
}

run().catch((err) => {
  error(err);
});

browser.storage.onChanged.addListener(async (_, areaName) => {
  if (areaName === 'local') {
    log('Storage changed');
    run().catch((err) => {
      error(err);
    });
  }
});
