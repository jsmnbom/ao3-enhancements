import { api, createLogger, options, tagListExclude, tagListIncludes } from '#common'

const COMMON_TAG_MENU_PROPS: browser.contextMenus._CreateCreateProperties = {
  contexts: ['link'],
  documentUrlPatterns: ['*://*.archiveofourown.org/*'],
  targetUrlPatterns: ['*://*.archiveofourown.org/tags/*'],
  type: process.env.BROWSER === 'firefox' ? 'checkbox' : 'normal',
}

const logger = createLogger('BG/menus')

function onCreated() {
  if (browser.runtime.lastError)
    logger.error('Error creating menu item:', browser.runtime.lastError)
}

// Chrome is stupid and doesn't remove old ones when reloading extension
void browser.contextMenus.removeAll()

const menus = {
  tag: {
    deny: browser.contextMenus.create({
      ...COMMON_TAG_MENU_PROPS,
      title: `${process.env.BROWSER === 'firefox' ? 'Add' : 'Add/remove'} tag in hidden tags list.`,
      id: 'menuIdDenyTag',
    }, onCreated),
    allow: browser.contextMenus.create({
      ...COMMON_TAG_MENU_PROPS,
      title: `${process.env.BROWSER === 'firefox' ? 'Add' : 'Add/remove'} tag in hidden tags exception list.`,
      id: 'menuIdAllowTag',
    }, onCreated),
  },
}

if (process.env.BROWSER === 'firefox') {
  let lastMenuInstanceId = 0
  let nextMenuInstanceId = 1

  browser.contextMenus.onShown.addListener((info, tab) => {
    (async () => {
      const tag = await api.getTag.sendToTab(tab.id!, info.linkUrl!)

      const menuInstanceId = nextMenuInstanceId++
      lastMenuInstanceId = menuInstanceId

      const { hideTagsDenyList, hideTagsAllowList } = await options.get([
        'hideTagsDenyList',
        'hideTagsAllowList',
      ])

      await browser.contextMenus.update(menus.tag.deny, {
        checked: tagListIncludes(hideTagsDenyList, tag),
      })
      await browser.contextMenus.update(menus.tag.allow, {
        checked: tagListIncludes(hideTagsAllowList, tag),
      })
      // Abort if the menu got closed
      if (menuInstanceId !== lastMenuInstanceId)
        return

      await browser.contextMenus.refresh()
    })().catch(e => logger.error(e))
  })

  browser.contextMenus.onHidden.addListener(() => {
    lastMenuInstanceId = 0
  })
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  (async () => {
    switch (info.menuItemId) {
      case menus.tag.deny: {
        const tag = await api.getTag.sendToTab(tab!.id!, info.linkUrl!)
        let hideTagsDenyList = await options.get('hideTagsDenyList')
        const shouldRemove = process.env.BROWSER === 'firefox'
          ? info.wasChecked
          : tagListIncludes(hideTagsDenyList, tag)

        if (shouldRemove)
          hideTagsDenyList = tagListExclude(hideTagsDenyList, tag)
        else
          hideTagsDenyList.push(tag)

        await options.set({
          hideTagsDenyList,
          hideTags: true,
        })

        await browser.notifications.create({
          type: 'basic',
          title: '[AO3 Enhancements] Tag hidden',
          message: `The tag "${tag.tag}" has been ${
            shouldRemove ? 'removed from' : 'added to'
          } to your list of hidden tags.`,
          iconUrl: 'icons/icon.svg',
        })
        break
      }
      case menus.tag.allow: {
        const tag = await api.getTag.sendToTab(tab!.id!, info.linkUrl!)
        let hideTagsAllowList = await options.get('hideTagsAllowList')
        const shouldRemove = process.env.BROWSER === 'firefox'
          ? info.wasChecked
          : tagListIncludes(hideTagsAllowList, tag)

        if (shouldRemove)
          hideTagsAllowList = tagListExclude(hideTagsAllowList, tag)
        else
          hideTagsAllowList.push(tag)

        await options.set({
          hideTagsAllowList,
          hideTags: true,
        })

        await browser.notifications.create({
          type: 'basic',
          title: '[AO3 Enhancements] Tag explicitly shown',
          message: `The tag "${tag.tag}" has been ${
            shouldRemove ? 'removed from' : 'added to'
          } your list of explicitly shown tags.`,
          iconUrl: 'icons/icon.svg',
        })
        break
      }
    }
  })().catch(e => logger.error(e))
})
