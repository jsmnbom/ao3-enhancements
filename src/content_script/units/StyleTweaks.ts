import { log, Options } from '@/common';
import { ADDON_CLASS } from '@/content_script/utils';
import Unit from '@/content_script/Unit';

export class StyleTweaks extends Unit {
  get enabled(): boolean {
    return this.options.styleWidthEnabled || this.options.showStatsColumns;
  }

  async beforeReady(): Promise<void> {
    const styleTag = document.createElement('style');
    styleTag.classList.add(ADDON_CLASS);
    document.head.appendChild(styleTag);

    const sheet = styleTag.sheet!;

    if (this.options.styleWidthEnabled) {
      this.insertRule(
        sheet,
        `#workskin {
          width: ${100 - this.options.styleWidth}%
        }`
      );
      this.insertRule(
        sheet,
        `.preface {
          margin: 0 !important
        }`
      );
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
        }`
      );
    }

    log(
      'Using style tweaks rules: ',
      // @ts-ignore
      Array.from(sheet.cssRules).map((rule) => rule.cssText)
    );
  }

  insertRule(sheet: StyleSheet, rule: string) {
    // @ts-ignore
    sheet.insertRule(rule, sheet.cssRules.length);
  }
}
