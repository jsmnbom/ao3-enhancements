import { ADDON_CLASS } from '#common'
import { Unit } from '#content_script/Unit.js'

export class StyleTweaks extends Unit {
  override get name() { return 'StyleTweaks' }
  override get enabled() { return this.options.styleWidthEnabled || this.options.showStatsColumns }

  override async ready(): Promise<void> {
    const styleTag = document.createElement('style')
    styleTag.classList.add(ADDON_CLASS)
    document.head.appendChild(styleTag)

    const sheet = styleTag.sheet!

    if (this.options.styleWidthEnabled) {
      this.insertRule(
        sheet,
        `#workskin {
          width: ${100 - this.options.styleWidth}%
        }`,
      )
      this.insertRule(
        sheet,
        `.preface {
          margin: 0 !important
        }`,
      )
    }

    if (this.options.showStatsColumns) {
      this.insertRule(
        sheet,
        `dl.stats > div {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start;
          margin-right: 1em;
          margin-bottom: 0.25em;
        }`,
      )
    }

    if (this.options.forceAlignment) {
      this.insertRule(
        sheet,
        `.userstuff * {
          text-align: ${this.options.forceAlignment} !important;
        }`,
      )
    }

    this.logger.debug(
      'Using style tweaks rules: ',
      Array.from(sheet.cssRules).map(rule => rule.cssText),
    )
  }

  insertRule(sheet: CSSStyleSheet, rule: string): void {
    sheet.insertRule(rule, sheet.cssRules.length)
  }
}
