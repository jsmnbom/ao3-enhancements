export * from './storage';
export * from './html';
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

export function log(...msgs: any) {
  console.log('[AO3 Enhancer]', ...msgs);
}

export function error(...msgs: any) {
  console.error('[AO3 Enhancer]', ...msgs);
}

export function isPrimitive(test: any) {
  return ['string', 'number', 'boolean'].includes(typeof test);
}
