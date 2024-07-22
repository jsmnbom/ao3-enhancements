import { ADDON_CLASS } from '#common'
import { type Tag, TagType } from '#common'

/**
 * Calls cb when page is ready
 */
export function ready(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState !== 'loading')
      resolve()
    else
      document.addEventListener('DOMContentLoaded', () => resolve())
  })
}

export function getTag(linkUrl: string): Tag | undefined {
  const url = new URL(linkUrl)
  const a = document.querySelector(`a[href="${url.pathname}"]`)

  if (!a)
    return

  return getTagFromElement(a)
}

export function getTagFromElement(tagElement: Element): Tag {
  const parent = tagElement?.closest('.fandoms,li')

  let tagType: TagType | undefined
  for (const type of TagType.values()) {
    const cssClass = TagType.toCSSClass(type)
    if (parent?.classList.contains(cssClass)) {
      tagType = type
      break
    }
  }

  return {
    name: tagElement.textContent!,
    type: tagType,
  }
}

export function isDarkTheme(): boolean {
  // console.log(window.getComputedStyle(document.body).backgroundColor)
  // const bodyBG = tinycolor(
  //   window.getComputedStyle(document.body).backgroundColor,
  // )
  // return bodyBG.isDark()
  return false
}

export function addThemeClass(clean = false): void {
  if (clean) {
    document.documentElement.classList.remove(`${ADDON_CLASS}-theme--light`)
    document.documentElement.classList.remove(`${ADDON_CLASS}-theme--dark`)
  }
  else {
    if (!document.body)
      return
    if (isDarkTheme())
      document.documentElement.classList.add(`${ADDON_CLASS}-theme--dark`)
    else
      document.documentElement.classList.add(`${ADDON_CLASS}-theme--light`)
  }
}
