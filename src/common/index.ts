export enum Command {
  openOptionsPage,
  test,
}

export type Message =
  | { cmd: Command.openOptionsPage }
  | { cmd: Command.test; data: any };

export function sendMessage(msg: Message): Promise<any> {
  return browser.runtime.sendMessage(msg).catch((err) => {
    console.error(`Could not send msg: ${msg}. `, err);
  });
}

export function log(...msgs: any) {
  console.log('[AO3 Enhancer]', ...msgs);
}

export function error(...msgs: any) {
  console.error('[AO3 Enhancer]', ...msgs);
}

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

export async function getValue<T>(id: string, defaultValue: T): Promise<T> {
  return await browser.storage.local
    .get({ [id]: defaultValue })
    .then((obj) => {
      return <T>obj[id];
    })
    .catch((err) => {
      error(
        `Could not read ${id} from storage. Setting to default ${defaultValue}.`,
        err
      );
      return defaultValue;
    });
}

export async function setValue<T>(id: string, value: T): Promise<void> {
  log(`Setting ${id} to ${value}.`);
  await browser.storage.local
    .set({ [id]: value })
    .catch((err) => {
      error(`Could not set ${id} with value ${value} to storage.`, err);
    });
}

export const ADDON_CLASS = 'ao3-enhancement';
