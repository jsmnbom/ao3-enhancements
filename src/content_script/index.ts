import { log, error, ADDON_CLASS } from '@/common';
import { addOptionsButton } from './optionsButton';
import { waitForOptions } from './options';
import { addTime } from './time';

/**
 * Calls cb when page is ready
 */
function ready(cb: () => void) {
  if (document.readyState != 'loading') {
    cb();
  } else {
    document.addEventListener('DOMContentLoaded', cb);
  }
}

/**
 * Clears any old DOM elements added by the extension. Needed
 */
function clearOld() {
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
  ready(() => {
    log('Ready!');
    addOptionsButton();
    addTime();
  });
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
