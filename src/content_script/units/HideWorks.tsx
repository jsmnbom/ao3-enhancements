import MdiEyeOff from '~icons/mdi/eye-off.jsx'
import MdiEye from '~icons/mdi/eye.jsx'

import { type Tag, type TagFilter, TagType } from '#common'
import { ADDON_CLASS } from '#common'
import { Unit } from '#content_script/Unit.js'
import { getTagFromElement } from '#content_script/utils.js'
import React from '#dom'

const BLURB_WRAPPER_CLASS = `${ADDON_CLASS}--hide-works--wrapper`

interface Blurb {
  language?: string | null
  fandoms: string[]
  authors: { userId: string, pseud?: string }[]
  tags: Tag[]
}

type HideReasons = Record<string, string[]>

function addHideReason(reasons: HideReasons, key: string, reason: string) {
  if (!(key in reasons))
    reasons[key] = []
  reasons[key]!.push(reason)
}

export class HideWorks extends Unit {
  static override get name() { return 'HideWorks' }
  override get enabled() {
    return (
      this.options.hideCrossovers.enabled
      || this.options.hideLanguages.enabled
      || this.options.hideAuthors.enabled
      || this.options.hideTags.enabled
    )
  }

  static override async clean(): Promise<void> {
    const wrappers = document.querySelectorAll(`.${BLURB_WRAPPER_CLASS}`)
    this.logger.debug('Cleaning wrappers', wrappers)
    for (const wrapper of wrappers) {
      const parent = wrapper.parentNode! as HTMLLIElement
      delete parent.dataset.ao3eHidden
      wrapper.parentNode!.append(...wrapper.childNodes)
      wrapper.remove()
    }
  }

  override async ready(): Promise<void> {
    this.logger.debug('Hiding works...')

    const blurbElements = document.querySelectorAll('.blurb')

    for (const blurbElement of blurbElements) {
      const blurb = getBlurb(blurbElement)
      const hideReasons = this.processBlurb(blurb)

      if (Object.keys(hideReasons).length === 0)
        continue

      this.hideWork(blurbElement, hideReasons)
    }
  }

  processBlurb(blurb: Blurb) {
    const { options: { hideLanguages, hideAuthors, hideCrossovers, hideTags } } = this
    const hideReasons: HideReasons = {}

    if (
      hideLanguages?.enabled
      && blurb.language
      && !hideLanguages.show.some(e => e.label === blurb.language)
    ) {
      addHideReason(hideReasons, 'Language', blurb.language)
    }

    if (
      hideCrossovers?.enabled
      && blurb.fandoms.length > hideCrossovers.maxFandoms
    ) {
      addHideReason(hideReasons, 'Too many fandoms', `${blurb.fandoms.length} > ${hideCrossovers.maxFandoms}`)
    }

    const tagMatches = hideTags?.enabled
      ? blurb.tags.map((tag) => {
          return hideTags.filters.find(filter => tagFilterMatchesTag(filter, tag))
        }).filter(e => e !== undefined)
      : []

    const authorFilters = hideAuthors?.enabled
      ? blurb.authors.map((author) => {
          return hideAuthors.filters.find((filter) => {
            return filter.userId === author.userId && (filter.pseud === undefined || filter.pseud === author.pseud)
          })
        }).filter(e => e !== undefined)
      : []

    const pseudMatches = hideAuthors?.enabled
      ? blurb.authors.map((author) => {
          return hideAuthors.filters.find((filter) => {
            return filter.userId === author.userId && filter.pseud !== undefined && filter.pseud === author.pseud
          })
        }).filter(e => e !== undefined)
      : []

    // if any inverted filter matches, return early
    if ([...tagMatches, ...authorFilters, ...pseudMatches].some(f => f?.invert)) {
      return hideReasons
    }

    for (const tagFilter of tagMatches)
      addHideReason(hideReasons, tagFilter.type ? TagType.toDisplayString(tagFilter!.type) : 'Tag', tagFilter!.name)

    for (const authorFilter of authorFilters)
      addHideReason(hideReasons, 'Author', authorFilter!.userId)

    for (const authorFilter of pseudMatches)
      addHideReason(hideReasons, 'Author', `${authorFilter!.userId} (${authorFilter!.pseud})`)

    return hideReasons
  }

  hideWork(blurb: Element, reasons: HideReasons): void {
    this.logger.debug('Hiding:', blurb)
    const wrapper = (
      <div class={BLURB_WRAPPER_CLASS} data-ao3e-hidden></div>
    )
    wrapper.append(...blurb.childNodes)
    blurb.append(wrapper)

    // If reasons should not be shown, just hide the entire <li>
    if (!this.options.hideShowReason) {
      (blurb as HTMLLIElement).hidden = true
      return
    }

    const reasonText = Object.entries(reasons).map(([key, vals]) => `${key}: ${vals.join(', ')}`).join(' | ')

    const isHiddenSpan: HTMLSpanElement = <span title="This work is hidden."><MdiEyeOff /></span>
    const wasHiddenSpan: HTMLSpanElement = <span title="This work was hidden."><MdiEye /></span>
    const showButtonSpan: HTMLSpanElement = (
      <span>
        <MdiEye />
        {' '}
        Show
      </span>
    )
    const hideButtonSpan: HTMLSpanElement = (
      <span>
        <MdiEyeOff />
        {' '}
        Hide
      </span>
    )
    const toggleButton = <button>{showButtonSpan}</button>
    const msg = (
      <div class={`${ADDON_CLASS}  ${ADDON_CLASS}--hide-works--msg`}>
        <div>
          {isHiddenSpan}
          <em>{reasonText}</em>
        </div>
        <div class="actions">{toggleButton}</div>
      </div>
    )

    toggleButton.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault()
      if (wrapper.dataset.ao3eHidden !== undefined) {
        isHiddenSpan.parentNode!.replaceChild(wasHiddenSpan, isHiddenSpan)
        toggleButton!.replaceChild(hideButtonSpan, showButtonSpan)
        delete wrapper.dataset.ao3eHidden
      }
      else {
        wasHiddenSpan.parentNode!.replaceChild(isHiddenSpan, wasHiddenSpan)
        toggleButton!.replaceChild(showButtonSpan, hideButtonSpan)
        wrapper.dataset.ao3eHidden = ''
      }
    })

    blurb.insertBefore(msg, blurb.childNodes[0]!)
  }
}

function getBlurb(blurbElement: Element): Blurb {
  const language = blurbElement.querySelector('dd.language')?.textContent

  const fandoms = Array.from(blurbElement.querySelectorAll('.fandoms a')).map(
    fandom => fandom.textContent!,
  )

  const authors = Array.from(
    blurbElement.querySelectorAll('.heading a[rel=author]'),
  ).map((author) => {
    const parts = new URL(author.href).pathname.split('/')
    return {
      userId: parts[2]!,
      pseud: parts[4],
    }
  })

  const tags: Tag[] = [
    ...Array.from(blurbElement.querySelector('.required-tags .rating')?.textContent?.split(',') || []).map(name => ({
      name: name.trim(),
      type: 'r' as TagType,
    })),
    ...Array.from(blurbElement.querySelector('.required-tags .category')?.textContent?.split(',') || []).map(name => ({
      name: name.trim(),
      type: 'c' as TagType,
    })),
    ...Array.from(blurbElement.querySelectorAll('.fandoms .tag')).map(tag => ({
      name: tag.textContent!,
      type: 'f' as TagType,
    })),
    ...Array.from(
      blurbElement.querySelectorAll(':not(.own) > ul.tags .tag'),
    ).map((tag) => {
      return getTagFromElement(tag)
    }),
  ]

  return { language, fandoms, authors, tags }
}

function tagFilterMatchesTag(filter: TagFilter, tag: Tag): boolean {
  if (filter.type !== undefined && filter.type !== tag.type) {
    return false
  }

  if (filter.matcher === 'contains') {
    return tag.name.toLowerCase().includes(filter.name.toLowerCase())
  }
  else if (filter.matcher === 'regex') {
    return new RegExp(filter.name.toLowerCase()).test(tag.name.toLowerCase())
  }

  return filter.name === tag.name
}
