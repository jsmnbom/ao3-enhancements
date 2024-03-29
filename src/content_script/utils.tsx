import React from 'dom-chef';
import tinycolor from 'tinycolor2';

import { Tag, TagType } from '@/common/options';

/**
 * Turn HTML code as string into element
 */
export function htmlToElement(html: string): Element {
  return htmlToElements(html)[0];
}

/**
 * Turn HTML code as string into elements
 */
export function htmlToElements(html: string): Element[] {
  const template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return Array.from(template.content.children);
}

export function icon(path: string): SVGElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={ADDON_CLASS + '--icon'}
      role="img"
    >
      <path fill="currentColor" d={path}></path>
    </svg>
  );
}

export const ADDON_CLASS = 'AO3E';

/**
 * Calls cb when page is ready
 */
export function ready(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState != 'loading') {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', () => resolve());
    }
  });
}

export function getTag(linkUrl: string): Tag {
  const url = new URL(linkUrl);
  const a = document.querySelector(`a[href="${url.pathname}"]`)!;

  const parent = a.closest('.fandoms,li')!;

  return {
    tag: a.textContent!,
    type: parent.classList[0].slice(0, -1) as TagType,
  };
}

export function isDarkTheme(): boolean {
  const bodyBG = tinycolor(
    window.getComputedStyle(document.body).backgroundColor
  );
  return bodyBG.isDark();
}

export function addThemeClass(clean = false): void {
  if (clean) {
    document.documentElement.classList.remove(`${ADDON_CLASS}-theme--light`);
    document.documentElement.classList.remove(`${ADDON_CLASS}-theme--dark`);
  } else {
    if (!document.body) return;
    if (isDarkTheme()) {
      document.documentElement.classList.add(`${ADDON_CLASS}-theme--dark`);
    } else {
      document.documentElement.classList.add(`${ADDON_CLASS}-theme--light`);
    }
  }
}
