/**
 * Turn HTML code as string into element
 */
export function htmlToElement(html: string): Element {
  const template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild as Element;
}

export function icon(path: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="${ADDON_CLASS}--icon" role="img"><path fill="currentColor" d="${path}"></path></svg>`;
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
