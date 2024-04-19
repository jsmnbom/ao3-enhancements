import { type Tag, type TagFilter, api, createLogger, options } from '#common'

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
    hide: browser.contextMenus.create({
      ...COMMON_TAG_MENU_PROPS,
      title: `${process.env.BROWSER === 'firefox' ? 'Hide' : 'Hide/unhide'} tag.`,
      id: 'menuIdhideTag',
    }, onCreated),
    show: browser.contextMenus.create({
      ...COMMON_TAG_MENU_PROPS,
      title: `${process.env.BROWSER === 'firefox' ? 'Show' : 'Show/unshow'} tag (overrides hide).`,
      id: 'menuIdshowTag',
    }, onCreated),
  },
}

const exactTagFilterPredicate = (tag: Tag) => (f: TagFilter) => f.name === tag.name && f.matcher === 'exact' && (f.type === undefined || f.type === tag.type)

if (process.env.BROWSER === 'firefox') {
  let lastMenuInstanceId = 0
  let nextMenuInstanceId = 1

  browser.contextMenus.onShown.addListener((info, tab) => {
    (async () => {
      const tag = await api.getTag.sendToTab(tab.id!, info.linkUrl!)

      const menuInstanceId = nextMenuInstanceId++
      lastMenuInstanceId = menuInstanceId

      const { filters } = await options.get('hideTags')

      const filter = filters.find(exactTagFilterPredicate(tag))

      await browser.contextMenus.update(menus.tag.hide, {
        checked: (!!filter && !filter.invert) || false,
      })
      await browser.contextMenus.update(menus.tag.show, {
        checked: (filter && filter.invert) || false,
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
      case menus.tag.hide: {
        const tag = await api.getTag.sendToTab(tab!.id!, info.linkUrl!)

        const { filters } = await options.get('hideTags')
        const filterIndex = filters.findIndex(exactTagFilterPredicate(tag))
        const filter = filterIndex !== -1 ? filters[filterIndex] : undefined
        let wasAlreadyHidden = false

        if (filter && !filter.invert) {
          wasAlreadyHidden = true
          filters.splice(filterIndex, 1)
        }

        if (filter && filter.invert)
          filter.invert = false

        if (!filter)
          filters.push({ ...tag, invert: false, matcher: 'exact' })

        await options.set({
          hideTags: { enabled: true, filters },
        })

        await api.toast.sendToTab(tab!.id!, `The tag "${tag.name}" has been ${wasAlreadyHidden ? 'unhidden' : 'hidden'}.`, { type: 'success' })
        break
      }
      case menus.tag.show: {
        const tag = await api.getTag.sendToTab(tab!.id!, info.linkUrl!)

        const { filters } = await options.get('hideTags')
        const filterIndex = filters.findIndex(exactTagFilterPredicate(tag))
        const filter = filterIndex !== -1 ? filters[filterIndex] : undefined
        let wasAlreadyShown = false

        if (filter && filter.invert) {
          wasAlreadyShown = true
          filters.splice(filterIndex, 1)
        }

        if (filter && !filter.invert)
          filter.invert = true

        if (!filter)
          filters.push({ ...tag, invert: true, matcher: 'exact' })

        await options.set({
          hideTags: { enabled: true, filters },
        })

        await api.toast.sendToTab(tab!.id!, `The tag "${tag.name}" has been ${wasAlreadyShown ? 'unshown' : 'shown'}.`, { type: 'success' })
        break
      }
    }
  })().catch(e => logger.error(e))
})
