import type { Tag } from '#common'

import { TagType } from '#common'

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
  const bgColor = window.getComputedStyle(document.body).backgroundColor
  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
    return isDark(bgColor)
  }
  return false
}

function isDark(color: string) {
  const rgbMatch = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/,
  )
  if (rgbMatch) {
    const r = Number.parseFloat(rgbMatch[1]!)
    const g = Number.parseFloat(rgbMatch[2]!)
    const b = Number.parseFloat(rgbMatch[3]!)
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b
    return brightness < 128
  }
  return false
}
