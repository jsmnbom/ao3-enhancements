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

export const ADDON_CLASS = 'ao3-enhancement';
