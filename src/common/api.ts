import { classToPlain, plainToClass } from 'class-transformer';

import { ReadingListItem } from './listData';

class ReceiveAPI {
  processBookmark(msg: {
    item: Record<string, unknown>;
    data: string[][];
    formAction: string;
  }) {
    return {
      data: new URLSearchParams(msg.data),
      item: plainToClass(ReadingListItem, msg.item),
      formAction: msg.formAction,
    };
  }
  getTag(msg: { linkUrl: string }) {
    return msg.linkUrl;
  }
}

class SendAPI {
  constructor(private _innerSend: (msg: unknown) => Promise<unknown>) {}
  async getTag(linkUrl: string) {
    return await this.send('getTag', { linkUrl });
  }

  async processBookmark(item: ReadingListItem, form: HTMLFormElement) {
    return await this.send('processBookmark', {
      data: Array.from(new FormData(form)) as string[][],
      item: classToPlain(item),
      formAction: form.action,
    });
  }
  private async send<T extends keyof ReceiveAPI>(
    msgType: T,
    msg: InnerMessage<T>
  ) {
    return this._innerSend({
      [msgType]: msg,
    });
  }
}

type InnerMessage<M extends keyof ReceiveAPI> = ReceiveAPI[M] extends (
  ...args: never
) => unknown
  ? Parameters<ReceiveAPI[M]>[0]
  : never;

export type Message = { [key in keyof ReceiveAPI]: InnerMessage<key> };

export const receive = new ReceiveAPI();
export const sendBG = (): InstanceType<typeof SendAPI> =>
  new SendAPI(async (msg) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await browser.runtime.sendMessage(msg);
  });
export const sendCS = (
  tabId: number,
  frameId: number
): InstanceType<typeof SendAPI> =>
  new SendAPI(async (msg) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await browser.tabs.sendMessage(tabId, msg, { frameId });
  });
