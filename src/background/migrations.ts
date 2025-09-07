import type { AuthorFilter, cache, Language, TagFilter } from '#common'

import { TagType } from '#common'

export async function migrate() {
  // Removed in 0.4.0
  await browser.storage.local.remove([
    'cache.kudosChecked',
    'cache.workPagesChecked',
    'cache.kudosGiven',
    'cache.bookmarked',
    'cache.subscribed',
  ])

  // In 0.5.0 we changed chapterDates to no longer be jsoned
  const key = `cache.chapterDates` as cache.Id
  const { [key]: val } = await browser.storage.local.get(key)
  if (typeof val === 'string') {
    const parsed = JSON.parse(val)
    await browser.storage.local.set({ [key]: parsed })
  }

  // In 0.5.0 we changed how hideWorks stores data
  const data = await browser.storage.local.get([
    'option.hideAuthors',
    'option.hideAuthorsList',
    'option.hideCrossovers',
    'option.hideCrossoversMaxFandoms',
    'option.hideLanguages',
    'option.hideLanguagesList',
    'option.hideTags',
    'option.hideTagsAllowList',
    'option.hideTagsDenyList',
  ])
  if (typeof data['option.hideAuthors'] === 'boolean') {
    const list = JSON.parse(data['option.hideAuthorsList']) as unknown
    const filters: AuthorFilter[] = Array.isArray(list)
      ? list.map(l => ({
          userId: l,
        }))
      : []
    await browser.storage.local.set({
      'option.hideAuthors': { enabled: data['option.hideAuthors'], filters },
    })
    await browser.storage.local.remove(['option.hideAuthorsList'])
  }
  if (typeof data['option.hideCrossovers'] === 'boolean') {
    const maxFandoms = data['option.hideCrossoversMaxFandoms']
    await browser.storage.local.set({
      'option.hideCrossovers': { enabled: data['option.hideCrossovers'], maxFandoms },
    })
    await browser.storage.local.remove(['option.hideCrossoversMaxFandoms'])
  }
  if (typeof data['option.hideLanguages'] === 'boolean') {
    const list = JSON.parse(data['option.hideLanguagesList']) as { text: string, value: string }[]
    const show: Language[] = Array.isArray(list)
      ? list.map(l => ({ label: l.text, value: l.value }))
      : []
    await browser.storage.local.set({
      'option.hideLanguages': { enabled: data['option.hideLanguages'], show },
    })
    await browser.storage.local.remove(['option.hideLanguagesList'])
  }
  if (typeof data['option.hideTags'] === 'boolean') {
    type OldTagType = 'fandom' | 'warning' | 'category' | 'relationship' | 'character' | 'freeform' | 'unknown'
    const oldTypeToNewType = (old: OldTagType) => {
      switch (old) {
        case 'fandom': return TagType.Fandom
        case 'warning': return TagType.ArchiveWarning
        case 'category': return TagType.Category
        case 'relationship': return TagType.Relationship
        case 'character': return TagType.Character
        case 'freeform': return TagType.Freeform
        default: return undefined
      }
    }
    const denyList = JSON.parse(data['option.hideTagsDenyList']) as ({ tag: string, type: OldTagType } | string)[]
    const allowList = JSON.parse(data['option.hideTagsAllowList']) as ({ tag: string, type: OldTagType } | string)[]
    const filters: TagFilter[] = []
    if (Array.isArray(denyList)) {
      filters.push(...denyList.map(l => ({
        name: typeof l === 'string' ? l : l.tag,
        type: oldTypeToNewType(typeof l === 'string' ? 'unknown' : l.type),
        matcher: 'exact' as const,
      })))
    }
    if (Array.isArray(allowList)) {
      filters.push(...allowList.map(l => ({
        name: typeof l === 'string' ? l : l.tag,
        type: oldTypeToNewType(typeof l === 'string' ? 'unknown' : l.type),
        matcher: 'exact' as const,
        invert: true,
      })))
    }
    await browser.storage.local.set({
      'option.hideTags': { enabled: data['option.hideTags'], filters },
    })
    await browser.storage.local.remove(['option.hideTagsAllowList', 'option.hideTagsDenyList'])
  }

  // In 0.5.0 we stopped JSONing
  const theme = await browser.storage.local.get(['option.theme'])
  if (typeof theme['option.theme'] === 'string') {
    const parsed = JSON.parse(theme['option.theme'])
    await browser.storage.local.set({ 'option.theme': parsed })
  }
  const user = await browser.storage.local.get(['option.user'])
  if (typeof user['option.user'] === 'string') {
    const parsed = JSON.parse(user['option.user'])
    if (typeof parsed === 'object' && parsed !== null && 'username' in parsed) {
      await browser.storage.local.set({ 'option.user': { userId: parsed.username } })
    }
    else {
      await browser.storage.local.set({ 'option.user': {} })
    }
  }

  // 0.5.4 had a bug where tag filters were not being migrated correctly
  // https://github.com/jsmnbom/ao3-enhancements/issues/75
  // Unfortunately the code deleted the old filters so we can't fix it now
  // But we can clean up the options so that the rest of the code at least will work again
  if (typeof data['option.hideTags'] === 'object' && Array.isArray(data['option.hideTags'].filters) && data['option.hideTags'].filters.length > 0) {
    if (data['option.hideTags'].filters.some((f: any) => f.matcher === 'exact' && f.name === undefined)) {
      await browser.storage.local.set({
        'option.hideTags': {
          enabled: data['option.hideTags'].enabled,
          filters: data['option.hideTags'].filters.filter((f: any) => {
            return f.matcher === 'exact' && f.name !== undefined
          }),
        },
      })
    }
  }
}
