import { log, error, ADDON_CLASS } from '@/common';
import { addOptionsButton } from './optionsButton';
import { waitForOptions } from './options';
import { addTime } from './time';
import { addKudosHitRatio } from './kudosHitsRatio';
import { hideWorks, cleanHidden } from './hideWorks';

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
      el.remove();
    }
  }
}

async function run() {
  clearOld();
  await waitForOptions();
  await ready();
  log('Ready!');
  addOptionsButton();
  hideWorks();
  addTime();
  addKudosHitRatio();
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
