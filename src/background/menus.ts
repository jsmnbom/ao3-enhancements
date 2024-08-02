import { type AuthorFilter, type Tag, type TagFilter, api, createLogger, options } from '#common'

let lastMenuInstanceId = 0
let nextMenuInstanceId = 1

const COMMON_MENU_PROPS = {
  contexts: ['link'],
  documentUrlPatterns: ['*://*.archiveofourown.org/*'],
  type: process.env.BROWSER === 'firefox' ? 'checkbox' : 'normal',
} satisfies browser.contextMenus._CreateCreateProperties

const TAG_URL_PATTERNS = ['*://*.archiveofourown.org/tags/*']
const AUTHOR_URL_PATTERNS = ['*://*.archiveofourown.org/users/*', '*://*.archiveofourown.org/users/*/pseuds/*']
const AUTHOR_PSEUD_URL_PATTERNS = ['*://*.archiveofourown.org/users/*/pseuds/*']

const logger = createLogger('BG/menus')

function onCreated() {
  if (browser.runtime.lastError)
    logger.error('Error creating menu item:', browser.runtime.lastError)
}

if (browser.contextMenus) {
  // Chrome is stupid and doesn't remove old ones when reloading extension
  void browser.contextMenus.removeAll()

  const menus = {
    tag: {
      hide: createLinkMenuItem(
        `${process.env.BROWSER === 'firefox' ? 'Hide' : 'Hide/unhide'} tag.`,
        TAG_URL_PATTERNS,
      ),
      show: createLinkMenuItem(
        `${process.env.BROWSER === 'firefox' ? 'Show' : 'Show/unshow'} tag (inverts hide).`,
        TAG_URL_PATTERNS,
      ),
    },
    author: {
      hide: createLinkMenuItem(
        `${process.env.BROWSER === 'firefox' ? 'Hide' : 'Hide/unhide'} author.`,
        AUTHOR_URL_PATTERNS,
      ),
      show: createLinkMenuItem(
        `${process.env.BROWSER === 'firefox' ? 'Show' : 'Show/unshow'} author (inverts hide).`,
        AUTHOR_URL_PATTERNS,
      ),
      hidePseud: createLinkMenuItem(
        `${process.env.BROWSER === 'firefox' ? 'Hide' : 'Hide/unhide'} this author pseud.`,
        AUTHOR_PSEUD_URL_PATTERNS,
      ),
      showPseud: createLinkMenuItem(
        `${process.env.BROWSER === 'firefox' ? 'Show' : 'Show/unshow'} this author pseud (inverts hide).`,
        AUTHOR_PSEUD_URL_PATTERNS,
      ),
    },
  }

  const exactTagFilterPredicate = (tag: Tag) => (f: TagFilter) => f.name === tag.name && f.matcher === 'exact' && (f.type === undefined || f.type === tag.type)

  async function onMenuShown(info: browser.contextMenus._OnShownInfo, tab: browser.tabs.Tab) {
    const url = new URL(info.linkUrl!)
    const parts = url.pathname.split('/').filter(Boolean)

    const menuInstanceId = nextMenuInstanceId++
    lastMenuInstanceId = menuInstanceId

    if (info.menuIds.includes(menus.tag.hide) || info.menuIds.includes(menus.tag.show)) {
      const tag = await api.getTag.sendToTab(tab.id!, info.linkUrl!)

      const { filters } = await options.get('hideTags')
      const filter = filters.find(exactTagFilterPredicate(tag))

      await browser.contextMenus.update(menus.tag.hide, {
        checked: (!!filter && !filter.invert) || false,
      })
      await browser.contextMenus.update(menus.tag.show, {
        checked: (filter && filter.invert) || false,
      })
    }

    if (info.menuIds.includes(menus.author.hide) || info.menuIds.includes(menus.author.show)) {
      const author = parts[1]

      const { filters } = await options.get('hideAuthors')
      const filter = filters.find(f => f.userId === author && f.pseud === undefined)

      await browser.contextMenus.update(menus.author.hide, {
        checked: (!!filter && !filter.invert) || false,
      })
      await browser.contextMenus.update(menus.author.show, {
        checked: (filter && filter.invert) || false,
      })
    }

    if (info.menuIds.includes(menus.author.hidePseud) || info.menuIds.includes(menus.author.showPseud)) {
      const author = parts[1]
      const pseud = parts[3]

      const { filters } = await options.get('hideAuthors')
      const filter = filters.find(f => f.userId === author && f.pseud === pseud)

      await browser.contextMenus.update(menus.author.hidePseud, {
        checked: (!!filter && !filter.invert) || false,
      })
      await browser.contextMenus.update(menus.author.showPseud, {
        checked: (filter && filter.invert) || false,
      })
    }

    // Abort if the menu got closed
    if (menuInstanceId !== lastMenuInstanceId)
      return

    await browser.contextMenus.refresh()
  }

  async function onMenuClick(info: browser.contextMenus.OnClickData, tab: browser.tabs.Tab) {
    const url = new URL(info.linkUrl!)
    const parts = url.pathname.split('/').filter(Boolean)

    if (info.menuItemId === menus.tag.hide || info.menuItemId === menus.tag.show) {
      const tag = await api.getTag.sendToTab(tab.id!, info.linkUrl!)

      const { filters } = await options.get('hideTags')
      const filterIndex = filters.findIndex(exactTagFilterPredicate(tag))
      const oldFilter = filterIndex !== -1 ? filters[filterIndex] : undefined
      const newFilter = { ...tag, matcher: 'exact' } as TagFilter

      if (oldFilter) {
        filters.splice(filterIndex, 1)
      }

      if (info.menuItemId === menus.tag.hide) {
        void api.toast.sendToTab(tab.id!, `The tag "${tag.name}" has been ${oldFilter && !oldFilter.invert ? 'unhidden' : 'hidden'}.`, { type: 'success' })

        if (!oldFilter || (oldFilter && oldFilter.invert)) {
          filters.push({ ...newFilter, invert: false })
        }
      }
      else {
        void api.toast.sendToTab(tab.id!, `The tag "${tag.name}" has been ${oldFilter && oldFilter.invert ? 'unshown' : 'shown'}.`, { type: 'success' })

        if (!oldFilter || (oldFilter && !oldFilter.invert)) {
          filters.push({ ...newFilter, invert: true })
        }
      }

      await options.set({
        hideTags: { enabled: true, filters },
      })
    }

    if (info.menuItemId === menus.author.hide || info.menuItemId === menus.author.show) {
      const author = parts[1]

      const { filters } = await options.get('hideAuthors')
      const filterIndex = filters.findIndex(f => f.userId === author && f.pseud === undefined)
      const oldFilter = filterIndex !== -1 ? filters[filterIndex] : undefined
      const newFilter = { userId: author } as AuthorFilter

      if (oldFilter) {
        filters.splice(filterIndex, 1)
      }

      if (info.menuItemId === menus.author.hide) {
        void api.toast.sendToTab(tab.id!, `The author "${author}" has been ${oldFilter && oldFilter.invert ? 'hidden' : 'unhidden'}.`, { type: 'success' })

        if (!oldFilter || (oldFilter && oldFilter.invert)) {
          filters.push({ ...newFilter, invert: false })
        }
      }
      else {
        void api.toast.sendToTab(tab.id!, `The author "${author}" has been ${oldFilter && !oldFilter.invert ? 'shown' : 'unshown'}.`, { type: 'success' })

        if (!oldFilter || (oldFilter && !oldFilter.invert)) {
          filters.push({ ...newFilter, invert: true })
        }
      }
      await options.set({
        hideAuthors: { enabled: true, filters },
      })
    }

    if (info.menuItemId === menus.author.hidePseud || info.menuItemId === menus.author.showPseud) {
      const author = parts[1]
      const pseud = parts[3]

      const { filters } = await options.get('hideAuthors')
      const filterIndex = filters.findIndex(f => f.userId === author && f.pseud === pseud)
      const oldFilter = filterIndex !== -1 ? filters[filterIndex] : undefined
      const newFilter = { userId: author, pseud } as AuthorFilter

      if (oldFilter) {
        filters.splice(filterIndex, 1)
      }

      if (info.menuItemId === menus.author.hidePseud) {
        void api.toast.sendToTab(tab.id!, `The pseud "${pseud}" of author "${author}" has been ${oldFilter && oldFilter.invert ? 'hidden' : 'unhidden'}.`, { type: 'success' })

        if (!oldFilter || (oldFilter && oldFilter.invert)) {
          filters.push({ ...newFilter, invert: false })
        }
      }
      else {
        void api.toast.sendToTab(tab.id!, `The pseud "${pseud}" of author "${author}" has been ${oldFilter && !oldFilter.invert ? 'shown' : 'unshown'}.`, { type: 'success' })

        if (!oldFilter || (oldFilter && !oldFilter.invert)) {
          filters.push({ ...newFilter, invert: true })
        }
      }

      await options.set({
        hideAuthors: { enabled: true, filters },
      })
    }
  }

  if (process.env.BROWSER === 'firefox') {
    browser.contextMenus.onShown.addListener((info, tab) => {
      console.log(info, tab)
      if (!tab)
        return
      onMenuShown(info, tab).catch(e => logger.error(e))
    })

    browser.contextMenus.onHidden.addListener(() => {
      lastMenuInstanceId = 0
    })
  }

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab)
      return
    onMenuClick(info, tab).catch(e => logger.error(e))
  })
}

function createLinkMenuItem(title: string, urlPatterns: string[]) {
  return browser.contextMenus?.create({
    ...COMMON_MENU_PROPS,
    id: title,
    title,
    targetUrlPatterns: urlPatterns,
  }, onCreated)
}
