import { classToPlain, plainToClass } from 'class-transformer';

import { default as defaultLogger } from './logger';
import { ReadingListItem } from './listData';
import { Tag } from './options';

const logger = defaultLogger.child('BG/list');

class APIMethod<
  Send extends Array<unknown>,
  Reply,
  Data extends Record<string, unknown>,
  Receive,
  MsgType extends string,
  Callback extends (
    arg: Receive,
    sender?: browser.runtime.MessageSender
  ) => Promise<Reply>
> {
  private _callback: Callback | undefined;
  constructor(
    private readonly msgType: MsgType,
    private readonly sendData: (...args: Send) => Data,
    private readonly receiveData: (data: Data) => Receive
  ) {}

  public async sendBG(...args: Send): Promise<Reply> {
    return (await browser.runtime.sendMessage({
      [this.msgType]: this.sendData(...args),
    })) as Reply;
  }
  public async sendCS(tabId: number, frameId: number, ...args: Send) {
    return (await browser.tabs.sendMessage(tabId, this.sendData(...args), {
      frameId,
    })) as Reply;
  }
  public addListener(callback: Callback): void {
    this._callback = callback;

    browser.runtime.onMessage.addListener(this.callback.bind(this));
  }

  private callback(
    msg: { [msgType in MsgType]: Data },
    sender: browser.runtime.MessageSender
  ): Promise<Reply> | false {
    if (msg[this.msgType]) {
      const data = this.receiveData(msg[this.msgType]);
      if (this._callback) {
        return this._callback(data, sender).catch((e) => {
          logger.error(
            `Error in api.${this.msgType} callback. Sender:`,
            sender,
            e
          );
          return Promise.reject(
            new Error(
              `Error in api.${this.msgType} callback. See other end for info.`
            )
          );
        });
      }
    }
    return false;
  }
}
function create<Reply>() {
  return function <
    Send extends Array<unknown>,
    Data extends Record<string, unknown>,
    Receive,
    MsgType extends string,
    Callback extends (
      arg: Receive,
      sender?: browser.runtime.MessageSender
    ) => Promise<Reply>
  >(
    msgType: MsgType,
    sendData: (...args: Send) => Data,
    receiveData: (data: Data) => Receive
  ): APIMethod<Send, Reply, Data, Receive, MsgType, Callback> {
    return new APIMethod<Send, Reply, Data, Receive, MsgType, Callback>(
      msgType,
      sendData,
      receiveData
    );
  };
}

export const api = {
  processBookmark: create<void>()(
    'processBookmark',
    (item: ReadingListItem) => {
      return {
        item: classToPlain(item),
      };
    },
    (data: { item: Record<string, unknown> }) => {
      return {
        item: plainToClass(ReadingListItem, data.item),
      };
    }
  ),
  getTag: create<Tag>()(
    'getTag',
    (linkUrl: string) => ({ linkUrl }),
    (data: { linkUrl: string }) => data.linkUrl
  ),
};
