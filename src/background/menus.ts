import { api } from '@/common/api';
import { childLogger } from '@/common/logger';
import { options, Tag } from '@/common/options';
import { tagListExclude, tagListIncludes } from '@/common/utils';

const logger = childLogger('BG/menus');

// Whether onShown exists, which means we can update the menus dynamically
const canUpdate = !!browser.contextMenus.onShown;

function onCreated() {
  if (browser.runtime.lastError) {
    logger.error('Error creating menu item:', browser.runtime.lastError);
  }
}

async function getTag(
  info: browser.contextMenus.OnClickData /*| browser.contextMenus._OnShownInfo*/,
  tab: browser.tabs.Tab
): Promise<Tag> {
  return await api.getTag.sendCS(tab.id!, info.frameId!, info.linkUrl!);
}

// Chrome is stupid and doesn't remove old ones when reloading extension
void browser.contextMenus.removeAll();

const commonMenuProperties: browser.contextMenus._CreateCreateProperties = {
  contexts: ['link'],
  documentUrlPatterns: ['*://*.archiveofourown.org/*'],
  targetUrlPatterns: ['*://*.archiveofourown.org/tags/*'],
  type: canUpdate ? 'checkbox' : 'normal',
};

const menuIdDenyTag = browser.contextMenus.create(
  {
    ...commonMenuProperties,
    title: `${canUpdate ? 'Add' : 'Add/remove'} tag in hidden tags list.`,
    id: 'menuIdDenyTag',
  },
  onCreated
);

const menuIdAllowTag = browser.contextMenus.create(
  {
    ...commonMenuProperties,
    title: `${
      canUpdate ? 'Add' : 'Add/remove'
    } tag in hidden tags exception list.`,
    id: 'menuIdAllowTag',
  },
  onCreated
);

if (canUpdate) {
  let lastMenuInstanceId = 0;
  let nextMenuInstanceId = 1;

  browser.contextMenus.onShown.addListener((info, tab) => {
    (async () => {
      const tag = await getTag(
        // TODO: Fix in types
        info as unknown as browser.contextMenus.OnClickData,
        tab
      );

      const menuInstanceId = nextMenuInstanceId++;
      lastMenuInstanceId = menuInstanceId;

      // Object destructure loses the types here for some reason
      const _options = await options.get([
        'hideTagsDenyList',
        'hideTagsAllowList',
      ]);
      const hideTagsDenyList = _options.hideTagsDenyList;
      const hideTagsAllowList = _options.hideTagsAllowList;

      await browser.contextMenus.update(menuIdDenyTag, {
        checked: tagListIncludes(hideTagsDenyList, tag),
      });
      await browser.contextMenus.update(menuIdAllowTag, {
        checked: tagListIncludes(hideTagsAllowList, tag),
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

browser.contextMenus.onClicked.addListener((info, tab) => {
  (async () => {
    switch (info.menuItemId) {
      case menuIdDenyTag: {
        const tag = await getTag(info, tab!);
        let hideTagsDenyList = await options.get('hideTagsDenyList');
        const shouldRemove = canUpdate
          ? info.wasChecked
          : tagListIncludes(hideTagsDenyList, tag);

        if (shouldRemove) {
          hideTagsDenyList = tagListExclude(hideTagsDenyList, tag);
        } else {
          hideTagsDenyList.push(tag);
        }

        await options.set({
          hideTagsDenyList,
          hideTags: true,
        });

        await browser.notifications.create({
          type: 'basic',
          title: '[AO3 Enhancements] Tag hidden',
          message: `The tag "${tag.tag}" has been ${
            shouldRemove ? 'removed from' : 'added to'
          } to your list of hidden tags.`,
          iconUrl: 'icons/icon.svg',
        });
        break;
      }
      case menuIdAllowTag: {
        const tag = await getTag(info, tab!);
        let hideTagsAllowList = await options.get('hideTagsAllowList');
        const shouldRemove = canUpdate
          ? info.wasChecked
          : tagListIncludes(hideTagsAllowList, tag);

        if (shouldRemove) {
          hideTagsAllowList = tagListExclude(hideTagsAllowList, tag);
        } else {
          hideTagsAllowList.push(tag);
        }

        await options.set({
          hideTagsAllowList,
          hideTags: true,
        });

        await browser.notifications.create({
          type: 'basic',
          title: '[AO3 Enhancements] Tag explicitly shown',
          message: `The tag "${tag.tag}" has been ${
            shouldRemove ? 'removed from' : 'added to'
          } your list of explicitly shown tags.`,
          iconUrl: 'icons/icon.svg',
        });
        break;
      }
    }
  })().catch((e) => logger.error(e));
});
