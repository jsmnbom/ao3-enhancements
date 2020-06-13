import { log, ADDON_CLASS } from '@/common';
import options from '../options';

function addStyles(sheet: StyleSheet, selector: string, rules: string[]) {
  let propStr = ``;
  for (const rule of rules) {
    propStr += `${rule};`;
  }
  // @ts-ignore
  sheet.insertRule(`${selector} { ${propStr} }`, sheet.cssRules.length);
}

export function styleTweaks() {
  if (options.styleWidthEnabled) {
    const styleTag = document.createElement('style');
    styleTag.classList.add(ADDON_CLASS);
    document.head.appendChild(styleTag);

    const sheet = styleTag.sheet!;

    if (options.styleWidthEnabled) {
      addStyles(sheet, '#workskin', [`width: ${100 - options.styleWidth}%`]);
      addStyles(sheet, '.preface', ['margin: 0 !important']);
    }

    log(
      'Using style tweaks rules: ',
      // @ts-ignore
      Array.from(sheet.cssRules).map((rule) => rule.cssText)
    );
  }
}
