import type { AuthorFilter, Tag, TagFilter } from '#common'

import { api, createLogger, options } from '#common'

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
  const authorFilterPredicate = (author: AuthorFilter) => (f: AuthorFilter) => f.userId === author.userId && f.pseud === undefined
  const authorPseudFilterPredicate = (author: AuthorFilter) => (f: AuthorFilter) => f.userId === author.userId && f.pseud === author.pseud

  function sendHideToast(tab: browser.tabs.Tab, action: 'hide' | 'show', what: string, alreadyExisted: boolean, wasInverted?: boolean) {
    const actionVerb = action === 'hide'
      ? (alreadyExisted && !wasInverted ? 'unhidden' : 'hidden')
      : (alreadyExisted && wasInverted ? 'unshown' : 'shown')

    void api.toast.sendToTab(tab.id!, `The ${what} has been ${actionVerb}.`, { type: 'success' })
  }

  async function onMenuClick(info: browser.contextMenus.OnClickData, tab: browser.tabs.Tab) {
    if (!info.linkUrl)
      return

    const url = new URL(info.linkUrl!)
    const parts = url.pathname.split('/').filter(Boolean)

    async function onMenuClickForHideWorks<
      Item extends Record<string, any>,
      Filter extends Item & { invert?: boolean },
    >(
      hideId: string | number,
      showId: string | number,
      getFilters: () => Promise<Filter[]>,
      getItem: () => Promise<Item>,
      predicate: (f: Item) => (f: Filter) => boolean,
      createFilter: (f: Item) => Filter,
      setFilters: (filters: Filter[]) => Promise<void>,
      formatItem: (f: Item) => string,
    ) {
      if (info.menuItemId === hideId || info.menuItemId === showId) {
        const item = await getItem()
        const filters = await getFilters()
        const filterIndex = filters.findIndex(predicate(item))
        const oldFilter = filterIndex !== -1 ? filters[filterIndex] : undefined
        const newFilter = createFilter(item)

        if (oldFilter) {
          filters.splice(filterIndex, 1)
        }

        if (info.menuItemId === hideId) {
          sendHideToast(tab, 'hide', formatItem(item), !!oldFilter, oldFilter?.invert)

          if (!oldFilter || (oldFilter && oldFilter.invert)) {
            filters.push({ ...newFilter })
          }
        }
        else if (info.menuItemId === showId) {
          sendHideToast(tab, 'show', formatItem(item), !!oldFilter, oldFilter?.invert)

          if (!oldFilter || (oldFilter && !oldFilter.invert)) {
            filters.push({ ...newFilter, invert: true })
          }
        }

        await setFilters(filters)
      }
    }

    await onMenuClickForHideWorks(
      menus.tag.hide,
      menus.tag.show,
      async () => (await options.get('hideTags')).filters,
      async () => api.getTag.sendToTab(tab.id!, info.linkUrl!),
      exactTagFilterPredicate,
      (tag: Tag) => ({ ...tag, matcher: 'exact' as const }),
      async (filters: TagFilter[]) => await options.set({
        hideTags: { enabled: true, filters },
      }),
      (tag: Tag) => `tag "${tag.name}"`,
    )

    await onMenuClickForHideWorks(
      menus.author.hide,
      menus.author.show,
      async () => (await options.get('hideAuthors')).filters,
      async () => ({ userId: parts[1]! }),
      authorFilterPredicate,
      (author: AuthorFilter) => ({ userId: author.userId }),
      async (filters: AuthorFilter[]) => await options.set({
        hideAuthors: { enabled: true, filters },
      }),
      (author: AuthorFilter) => `author "${author.userId}"`,
    )

    await onMenuClickForHideWorks(
      menus.author.hidePseud,
      menus.author.showPseud,
      async () => (await options.get('hideAuthors')).filters,
      async () => ({ userId: parts[1]!, pseud: parts[3] } as AuthorFilter),
      authorPseudFilterPredicate,
      (author: AuthorFilter) => ({ userId: author.userId, pseud: author.pseud }),
      async (filters: AuthorFilter[]) => await options.set({
        hideAuthors: { enabled: true, filters },
      }),
      (author: AuthorFilter) => `pseud "${author.pseud}" of author "${author.userId}"`,
    )
  }

  if (process.env.BROWSER === 'firefox') {
    async function onMenuShown(info: browser.contextMenus._OnShownInfo, tab: browser.tabs.Tab) {
      if (!info.linkUrl)
        return

      const url = new URL(info.linkUrl!)
      const parts = url.pathname.split('/').filter(Boolean)

      const menuInstanceId = nextMenuInstanceId++
      lastMenuInstanceId = menuInstanceId

      async function onMenuShownForHideWorks<
        Item extends Record<string, any>,
        Filter extends Item & { invert?: boolean },
      >(
        hideId: string | number,
        showId: string | number,
        getFilters: () => Promise<Filter[]>,
        getItem: () => Promise<Item>,
        predicate: (f: Item) => (f: Filter) => boolean,
      ) {
        if (info.menuIds.includes(hideId) || info.menuIds.includes(showId)) {
          const filters = await getFilters()
          const filter = filters.find(predicate(await getItem()))

          console.log('filter', filter)

          await browser.contextMenus.update(hideId, {
            checked: (!!filter && !filter.invert) || false,
          })
          await browser.contextMenus.update(showId, {
            checked: (!!filter && filter.invert) || false,
          })
        }
      }

      await onMenuShownForHideWorks(
        menus.tag.hide,
        menus.tag.show,
        async () => (await options.get('hideTags')).filters,
        async () => api.getTag.sendToTab(tab.id!, info.linkUrl!),
        exactTagFilterPredicate,
      )

      await onMenuShownForHideWorks(
        menus.author.hide,
        menus.author.show,
        async () => (await options.get('hideAuthors')).filters,
        async () => ({ userId: parts[1] } as AuthorFilter),
        authorFilterPredicate,
      )

      await onMenuShownForHideWorks(
        menus.author.hidePseud,
        menus.author.showPseud,
        async () => (await options.get('hideAuthors')).filters,
        async () => ({ userId: parts[1], pseud: parts[3] } as AuthorFilter),
        authorPseudFilterPredicate,
      )

      // Abort if the menu got closed
      if (menuInstanceId !== lastMenuInstanceId)
        return

      await browser.contextMenus.refresh()
    }

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
