import MdiEyeOff from '~icons/mdi/eye-off.jsx'
import MdiEye from '~icons/mdi/eye.jsx'

import type { Tag, TagFilter, TagType } from '#common'

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

export class HideWorks extends Unit {
  override get name() { return 'HideWorks' }
  override get enabled() {
    return (
      this.options.hideCrossovers.enabled
      || this.options.hideLanguages.enabled
      || this.options.hideAuthors.enabled
      || this.options.hideTags.enabled
    )
  }

  override async clean(): Promise<void> {
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

      const hideReasons: string[] = []

      if (this.options.hideLanguages && this.options.hideLanguages.enabled && blurb.language) {
        if (!this.options.hideLanguages.show.some(e => e.label === blurb.language)) {
          hideReasons.push(`Language: ${blurb.language}`)
        }
      }

      if (this.options.hideCrossovers && this.options.hideCrossovers.enabled) {
        if (blurb.fandoms.length > this.options.hideCrossovers.maxFandoms)
          hideReasons.push(`Too many fandoms: ${blurb.fandoms.length}`)
      }

      hideReasons.push(...this.processCompositeReasons(blurb))

      if (hideReasons.length > 0)
        this.hideWork(blurbElement, hideReasons)
    }
  }

  processCompositeReasons(blurb: Blurb) {
    const tagMatches = this.options.hideTags && this.options.hideTags.enabled
      ? blurb.tags.map((tag) => {
          return this.options.hideTags.filters.find(filter => tagFilterMatchesTag(filter, tag))
        })
      : []

    const authorMatches = this.options.hideAuthors && this.options.hideAuthors.enabled
      ? blurb.authors.map((author) => {
          return this.options.hideAuthors.filters.find((filter) => {
            return filter.userId === author.userId && filter.pseud === undefined
          })
        })
      : []

    const authorPsuedMatches = this.options.hideAuthors && this.options.hideAuthors.enabled
      ? blurb.authors.map((author) => {
          return this.options.hideAuthors.filters.find((filter) => {
            return filter.userId === author.userId && filter.pseud !== undefined && filter.pseud === author.pseud
          })
        })
      : []

    if (authorMatches.some(e => e?.invert) || tagMatches.some(e => e?.invert) || authorPsuedMatches.some(e => e?.invert)) {
      return []
    }

    const hideReasons: string[] = []

    const hiddenTags = tagMatches.filter(e => e !== undefined).map(e => `${e?.name}`)
    if (hiddenTags.length > 0)
      hideReasons.push(`Tag: ${hiddenTags.join(', ')}`)

    const hiddenAuthors = authorMatches.filter(e => e !== undefined).map(e => `${e?.userId}`)
    if (hiddenAuthors.length > 0)
      hideReasons.push(`Author: ${hiddenAuthors.join(', ')}`)

    const hiddenAuthorPseuds = authorPsuedMatches.filter(e => e !== undefined).map(e => `${e.userId} (${e.pseud})`)
    if (hiddenAuthorPseuds.length > 0)
      hideReasons.push(`Author: ${hiddenAuthorPseuds.join(', ')}`)

    return hideReasons
  }

  hideWork(blurb: Element, reasons: string[]): void {
    this.logger.debug('Hiding:', blurb)
    const wrapper = (
      <div class={BLURB_WRAPPER_CLASS} data-ao3e-hidden></div>
    )
    wrapper.append(...blurb.childNodes)
    blurb.append(wrapper)

    if (this.options.hideShowReason) {
      const isHiddenSpan: HTMLSpanElement = <span title="This work is hidden."><MdiEyeOff /></span>
      const wasHiddenSpan: HTMLSpanElement = <span title="This work was hidden."><MdiEye /></span>
      const showButton = (
        <a href="#">
          <MdiEye />
          {' '}
          Show
        </a>
      )
      const hideButton = (
        <a href="#">
          <MdiEyeOff />
          {' '}
          Hide
        </a>
      )
      const msg = (
        <div class={`${ADDON_CLASS}  ${ADDON_CLASS}--work-hidden--msg`}>
          <span>
            {isHiddenSpan}
            <em>{reasons.join(' | ')}</em>
          </span>
          <div class="actions">{showButton}</div>
        </div>
      )

      showButton.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault()
        isHiddenSpan.parentNode!.replaceChild(wasHiddenSpan, isHiddenSpan)
        showButton.parentNode!.replaceChild(hideButton, showButton)
        delete wrapper.dataset.ao3eHidden
      })

      hideButton.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault()
        wasHiddenSpan.parentNode!.replaceChild(isHiddenSpan, wasHiddenSpan)
        hideButton.parentNode!.replaceChild(showButton, hideButton)
        wrapper.dataset.ao3eHidden = ''
      })

      blurb.insertBefore(msg, blurb.childNodes[0])
    }
    else {
      (blurb as HTMLLIElement).hidden = true
    }
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
      userId: parts[2],
      pseud: parts[4],
    }
  })

  const tags: Tag[] = [
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
