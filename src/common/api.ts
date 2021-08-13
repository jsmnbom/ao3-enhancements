import { classToPlain, plainToClass } from 'class-transformer';

import { default as defaultLogger } from './logger';
import { Conflict, ReadingListItem } from './listData';
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
  private _callbacks: Array<Callback> = [];
  private boundCallback = this.callback.bind(this);
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
    return (await browser.tabs.sendMessage(
      tabId,
      {
        [this.msgType]: this.sendData(...args),
      },
      {
        frameId,
      }
    )) as Reply;
  }
  public addListener(callback: Callback): void {
    this._callbacks.push(callback);
    if (!browser.runtime.onMessage.hasListener(this.boundCallback)) {
      browser.runtime.onMessage.addListener(this.boundCallback);
    }
  }
  public removeListener(callback: Callback): void {
    this._callbacks = this._callbacks.filter((cb) => cb !== callback);
  }

  private callback(
    msg: { [msgType in MsgType]: Data },
    sender: browser.runtime.MessageSender
  ): Promise<Reply> | false {
    if (msg[this.msgType]) {
      const data = this.receiveData(msg[this.msgType]);
      for (const callback of this._callbacks) {
        return callback(data, sender).catch((e) => {
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
  getTag: create<Tag>()(
    'getTag',
    (linkUrl: string) => ({ linkUrl }),
    (data: { linkUrl: string }) => data.linkUrl
  ),
  readingListUpdate: create<void>()(
    'readingListUpdate',
    (workId: number, item: ReadingListItem | null) => {
      return {
        workId,
        item: item !== null ? classToPlain(item) : null,
      };
    },
    (data: { workId: number; item: Record<string, unknown> | null }) => {
      return data;
    }
  ),
  readingListSet: create<void>()(
    'readingListSet',
    (workId: number, item: ReadingListItem | null) => ({
      workId,
      item: classToPlain(item),
    }),
    (data: { workId: number; item: Record<string, unknown> | null }) => {
      if (data.item === null) {
        return {
          workId: data.workId,
          item: null,
        };
      }
      const x = plainToClass(ReadingListItem, data.item) as ReadingListItem;
      x.workId = data.workId;
      return {
        workId: data.workId,
        item: x,
      };
    }
  ),
  readingListFetch: create<Record<number, Record<string, unknown>>>()(
    'readingListFetch',
    () => ({}),
    (data) => {
      return data;
    }
  ),
  readingListSync: create<void>()(
    'readingListSync',
    () => ({}),
    (data) => {
      return data;
    }
  ),
  readingListSyncProgress: create<void>()(
    'readingListSyncProgress',
    (progress: string, complete: boolean, overwrite: boolean) => ({
      progress,
      complete,
      overwrite,
    }),
    (data) => {
      return data;
    }
  ),
  readingListSyncConflict: create<'local' | 'remote'>()(
    'readingListSyncConflict',
    (conflict: Conflict) => ({
      conflict: classToPlain(conflict),
    }),
    (data) => {
      return Conflict.fromPlain(data.conflict);
    }
  ),
};
