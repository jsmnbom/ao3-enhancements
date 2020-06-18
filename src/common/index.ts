export * from './cache';
export * from './options';

export enum Command {
  openOptionsPage,
}

export type Message = { cmd: Command.openOptionsPage };

export function sendMessage(msg: Message): Promise<any> {
  return browser.runtime.sendMessage(msg).catch((err) => {
    console.error(`Could not send msg: ${msg}. `, err);
  });
}

const logPrefix = '[AO3 Enhancements]';

export const log = console.log.bind(window.console, logPrefix);

export const error = console.error.bind(window.console, logPrefix);

export const groupCollapsed = console.groupCollapsed.bind(window.console, logPrefix);

export const groupEnd = console.groupEnd.bind(window.console, logPrefix);

export function isPrimitive(test: any) {
  return ['string', 'number', 'boolean'].includes(typeof test);
}
