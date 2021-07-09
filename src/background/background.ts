import { logger as defaultLogger, getOptions, setOptions } from '@/common';

const logger = defaultLogger.child('BG');

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason == 'update') {
    // Changed to cache.workPagesChecked and has
    // other meaning so remove completely
    void browser.storage.local.remove('cache.kudosChecked');
  }
});

// Whether onShown exists, which means we can update the menus dynamically
const canUpdate = !!browser.contextMenus?.onShown;

function onCreated() {
  if (browser.runtime.lastError) {
    logger.error('Error creating menu item:', browser.runtime.lastError);
  }
}

function getTag(
  info: browser.contextMenus.OnClickData | browser.contextMenus._OnShownInfo
) {
  if (info.linkText) return info.linkText;
  // Chrome doesn't have .linkText so extract it from the
  return decodeURI(
    new URL(info.linkUrl!).pathname.split('/')[2].replace(/\*s\*/g, '/')
  );
}

// Chrome is stupid and doesn't remove old ones when reloading extension
void browser.contextMenus.removeAll();

const menuIdDenyTag = browser.contextMenus.create(
  {
    contexts: ['link'],
    documentUrlPatterns: ['*://archiveofourown.org/*'],
    targetUrlPatterns: ['*://archiveofourown.org/tags/*'],
    title: `${canUpdate ? 'Add' : 'Add/remove'} tag in hidden tags list.`,
    id: 'menuIdDenyTag',
    type: canUpdate ? 'checkbox' : 'normal',
  },
  onCreated
);

const menuIdAllowTag = browser.contextMenus.create(
  {
    contexts: ['link'],
    documentUrlPatterns: ['*://archiveofourown.org/*'],
    targetUrlPatterns: ['*://archiveofourown.org/tags/*'],
    title: `${
      canUpdate ? 'Add' : 'Add/remove'
    } tag in hidden tags exception list.`,
    id: 'menuIdAllowTag',
    type: canUpdate ? 'checkbox' : 'normal',
  },
  onCreated
);

if (canUpdate) {
  let lastMenuInstanceId = 0;
  let nextMenuInstanceId = 1;

  browser.contextMenus.onShown.addListener((info) => {
    (async () => {
      const tag = getTag(info);

      const menuInstanceId = nextMenuInstanceId++;
      lastMenuInstanceId = menuInstanceId;

      // Object destructure loses the types here for some reason
      const _options = await getOptions([
        'hideTagsDenyList',
        'hideTagsAllowList',
      ]);
      const hideTagsDenyList = _options.hideTagsDenyList;
      const hideTagsAllowList = _options.hideTagsAllowList;

      await browser.contextMenus.update(menuIdDenyTag, {
        checked: hideTagsDenyList.includes(tag),
      });
      await browser.contextMenus.update(menuIdAllowTag, {
        checked: hideTagsAllowList.includes(tag),
      });
      // Abort if the menu got closed
      if (menuInstanceId !== lastMenuInstanceId) {
        return;
      }
      await browser.contextMenus.refresh();
    })().catch((e) => logger.error(e));
  });

  browser.contextMenus.onHidden.addListener(function () {
    lastMenuInstanceId = 0;
  });
}

browser.contextMenus.onClicked.addListener((info) => {
  (async () => {
    switch (info.menuItemId) {
      case menuIdDenyTag: {
        const tag = getTag(info);
        let hideTagsDenyList = await getOptions('hideTagsDenyList');
        const remove = canUpdate
          ? info.wasChecked
          : hideTagsDenyList.includes(tag);

        if (remove) {
          hideTagsDenyList = hideTagsDenyList.filter((item) => item !== tag);
        } else {
          hideTagsDenyList.push(tag);
        }

        await setOptions({
          hideTagsDenyList,
          hideTags: true,
        });

        await browser.notifications.create({
          type: 'basic',
          title: '[AO3 Enhancements] Tag hidden',
          message: `The tag "${tag}" has been ${
            remove ? 'removed from' : 'added to'
          } to your list of hidden tags.`,
          iconUrl: 'icons/icon.svg',
        });
        break;
      }
      case menuIdAllowTag: {
        const tag = getTag(info);
        let hideTagsAllowList = await getOptions('hideTagsAllowList');
        const remove = canUpdate
          ? info.wasChecked
          : hideTagsAllowList.includes(tag);

        if (remove) {
          hideTagsAllowList = hideTagsAllowList.filter((item) => item !== tag);
        } else {
          hideTagsAllowList.push(tag);
        }

        await setOptions({
          hideTagsAllowList,
          hideTags: true,
        });

        await browser.notifications.create({
          type: 'basic',
          title: '[AO3 Enhancements] Tag explicitly shown',
          message: `The tag "${tag}" has been ${
            remove ? 'removed from' : 'added to'
          } your list of explicitly shown tags.`,
          iconUrl: 'icons/icon.svg',
        });
        break;
      }
    }
  })().catch((e) => logger.error(e));
});
