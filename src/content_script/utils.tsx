import { h as createElement } from 'dom-chef';

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
