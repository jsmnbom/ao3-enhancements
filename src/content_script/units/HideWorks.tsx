import MdiEyeOff from '~icons/mdi/eye-off.jsx'
import MdiEye from '~icons/mdi/eye.jsx'

import { ADDON_CLASS, type Tag, type TagType, Unit } from '#common'
import React from '#dom'

export class HideWorks extends Unit {
  readonly blurbWrapperClass = `${ADDON_CLASS}--hide-works--wrapper`

  async clean(): Promise<void> {
    const blurbWrappers = document.querySelectorAll(
      `.${this.blurbWrapperClass}`,
    )
    this.logger.debug('Cleaning wrappers', blurbWrappers)
    for (const blurbWrapper of blurbWrappers) {
      const parent = blurbWrapper.parentNode! as HTMLLIElement
      delete parent.dataset.ao3eHidden
      blurbWrapper.parentNode!.append(...blurbWrapper.childNodes)
      blurbWrapper.remove()
    }
  }

  get enabled(): boolean {
    return (
      this.options.hideCrossovers
      || this.options.hideLanguages
      || this.options.hideAuthors
      || this.options.hideTags
    )
  }

  async ready(): Promise<void> {
    this.logger.debug('Hiding works...')

    const blurbs = document.querySelectorAll('li.blurb')

    for (const blurb of blurbs) {
      const hideReasons = []

      if (this.options.hideLanguages) {
        const language = blurb.querySelector('dd.language')
        if (
          language !== null
          && !this.options.hideLanguagesList.some(
            e => e.text === language.textContent!,
          )
        )
          hideReasons.push(`Language: ${language.textContent!}`)
      }
      if (this.options.hideCrossovers) {
        const fandomCount = blurb.querySelectorAll('.fandoms a').length
        if (fandomCount > this.options.hideCrossoversMaxFandoms)
          hideReasons.push(`Too many fandoms: ${fandomCount}`)
      }

      if (this.options.hideAuthors) {
        const authors = Array.from(
          blurb.querySelectorAll('.heading a[rel=author]'),
        ).map(author => author.textContent!.trim())
        const hidden = this.options.hideAuthorsList.filter(author =>
          authors.includes(author),
        )
        if (hidden.length > 0) {
          hideReasons.push(
            `${hidden.length > 1 ? 'Authors' : 'Author'}: ${hidden.join(', ')}`,
          )
        }
      }

      if (this.options.hideTags) {
        const tags: Tag[] = [
          ...Array.from(blurb.querySelectorAll('.fandoms .tag')).map(tag => ({
            tag: tag.textContent!,
            type: 'fandom' as TagType,
          })),
          ...Array.from(
            blurb.querySelectorAll(':not(.own) > ul.tags .tag'),
          ).map((tag) => {
            return {
              tag: tag.textContent!,
              type: tag.closest('li')!.classList[0].slice(0, -1) as TagType,
            }
          }),
        ]
        const denyList = this.options.hideTagsDenyList
        const allowList = this.options.hideTagsAllowList

        const denied = tags.filter((tag) => {
          return (
            denyList.filter((deny) => {
              return (
                deny.tag === tag.tag
                && (deny.type === tag.type || deny.type === 'unknown')
              )
            }).length > 0
          )
        })
        if (denied.length > 0) {
          if (
            !tags.some((tag) => {
              return (
                allowList.filter((allow) => {
                  return (
                    allow.tag === tag.tag
                    && (allow.type === tag.type || allow.type === 'unknown')
                  )
                }).length > 0
              )
            })
          ) {
            hideReasons.push(
              `${denied.length > 1 ? 'Tags' : 'Tag'}: ${denied
                .map(tag => tag.tag)
                .join(', ')}`,
            )
          }
        }
      }

      if (hideReasons.length > 0)
        this.hideWork(blurb, hideReasons)
    }
  }

  hideWork(blurb: Element, reasons: string[]): void {
    this.logger.debug('Hiding:', blurb)
    const blurbWrapper = (
      <div class={this.blurbWrapperClass} data-ao3e-hidden></div>
    )
    blurbWrapper.append(...blurb.childNodes)
    blurb.append(blurbWrapper)

    if (this.options.hideShowReason) {
      const isHiddenSpan: HTMLSpanElement = (
        <span title="This work is hidden."><MdiEyeOff /></span>
      )
      const wasHiddenSpan: HTMLSpanElement = (
        <span title="This work was hidden."><MdiEye /></span>
      )

      const showButton = (
        <a
          href="#"
          onClick={(e: MouseEvent) => {
            e.preventDefault()
            isHiddenSpan.parentNode!.replaceChild(wasHiddenSpan, isHiddenSpan)
            // eslint-disable-next-line ts/no-use-before-define
            showButton.parentNode!.replaceChild(hideButton, showButton)
            delete blurbWrapper.dataset.ao3eHidden
          }}
        >
          <MdiEye />
          {' '}
          Show
        </a>
      )
      const hideButton = (
        <a
          href="#"
          onClick={(e: MouseEvent) => {
            e.preventDefault()
            wasHiddenSpan.parentNode!.replaceChild(isHiddenSpan, wasHiddenSpan)
            hideButton.parentNode!.replaceChild(showButton, hideButton)
            blurbWrapper.dataset.ao3eHidden = ''
          }}
        >
          <MdiEyeOff />
          {' '}
          Hide
        </a>
      )

      const msg = (
        <div
          classNames={[ADDON_CLASS, `${ADDON_CLASS}--work-hidden--msg`]}
        >
          <span>
            {isHiddenSpan}
            <em>{reasons.join(' | ')}</em>
          </span>
          <div className="actions">{showButton}</div>
        </div>
      )

      blurb.insertBefore(msg, blurb.childNodes[0])
    }
    else {
      (blurb as HTMLLIElement).hidden = true
    }
  }
}
