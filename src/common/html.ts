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
export function addItem(
  klass: string,
  label: string,
  value: string,
  parent: Element,
  beforeElement: Element
): [Element, Element] {
  // Create dt elements and add them in the appropiate place
  const labelDt = document.createElement('dt');
  labelDt.classList.add(klass);
  labelDt.classList.add(ADDON_CLASS);
  labelDt.textContent = label;

  const valueDd = document.createElement('dd');
  valueDd.classList.add(klass);
  valueDd.classList.add(ADDON_CLASS);
  valueDd.textContent = value;

  parent.insertBefore(valueDd, beforeElement);
  parent.insertBefore(labelDt, valueDd);

  return [labelDt, valueDd];
}

export const ADDON_CLASS = 'ao3-enhancement';
