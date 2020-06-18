import { log, Options } from '@/common';
import { ADDON_CLASS } from '@/content_script/utils';
import Unit from '@/content_script/Unit';

export class StyleTweaks extends Unit {
  get enabled(): boolean {
    return this.options.styleWidthEnabled;
  }

  async beforeReady(): Promise<void> {
    const styleTag = document.createElement('style');
    styleTag.classList.add(ADDON_CLASS);
    document.head.appendChild(styleTag);

    const sheet = styleTag.sheet!;

    if (this.options.styleWidthEnabled) {
      this.addStyles(sheet, '#workskin', [
        `width: ${100 - this.options.styleWidth}%`,
      ]);
      this.addStyles(sheet, '.preface', ['margin: 0 !important']);
    }

    log(
      'Using style tweaks rules: ',
      // @ts-ignore
      Array.from(sheet.cssRules).map((rule) => rule.cssText)
    );
  }

  addStyles(sheet: StyleSheet, selector: string, rules: string[]) {
    let propStr = ``;
    for (const rule of rules) {
      propStr += `${rule};`;
    }
    // @ts-ignore
    sheet.insertRule(`${selector} { ${propStr} }`, sheet.cssRules.length);
  }
}
