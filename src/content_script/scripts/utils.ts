import statsItemTemplate from './statsItem.pug';

/**
 * Turn HTML code as string into element
 */
export function htmlToElement(html: string): Element {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild as Element;
}

/**
 * Add a dt and dd definition item to a dl
 */
export function addStatsItem(
  klass: string,
  label: string,
  value: string,
  parent: Element,
  beforeElement: Element
): Element {
  const element = htmlToElement(statsItemTemplate({
    label, value, klass
  }))

  parent.insertBefore(element, beforeElement);

  return element;
}

export function icon(path: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="${ADDON_CLASS}--icon" role="img"><path fill="currentColor" d="${path}"></path></svg>`;
}

export const ADDON_CLASS = 'AO3E';

export const nbsp = '\u00A0';
