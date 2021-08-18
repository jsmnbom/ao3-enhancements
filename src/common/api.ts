import { classToPlain, plainToClass } from 'class-transformer';

import { childLogger } from './logger';
import { SyncConflict, BaseWork, PlainWork } from './readingListData';
import { Tag } from './options';

const logger = childLogger('API');

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
    try {
      return (await browser.runtime.sendMessage({
        [this.msgType]: this.sendData(...args),
      })) as Reply;
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.startsWith('||')) {
          const [_1, _2, name, ...rest] = e.message.split('|');
          const msg = rest.join('|');
          const error = new Error(msg);
          error.name = name;
          throw error;
        }
      }
      throw e;
    }
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
          // Put error type into message, to preserve it across the IPC
          if (e instanceof Error) {
            e.message = `||${e.name}|${e.message}`;
          }
          return Promise.reject(e);
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

export class SyncError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'SyncError';
  }
}

export class SyncAbort extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'SyncAbort';
  }
}

export const api = {
  getTag: create<Tag>()(
    'getTag',
    (linkUrl: string) => ({ linkUrl }),
    (data: { linkUrl: string }) => data.linkUrl
  ),
  readingListUpdate: create<void>()(
    'readingListUpdate',
    (workId: number, item: BaseWork | null) => {
      return {
        workId,
        item: item !== null ? (classToPlain(item) as PlainWork) : null,
      };
    },
    (data: { workId: number; item: PlainWork | null }) => {
      return data;
    }
  ),
  readingListSet: create<void>()(
    'readingListSet',
    (workId: number, item: BaseWork | null) => ({
      workId,
      item: classToPlain(item) as PlainWork,
    }),
    (data: { workId: number; item: PlainWork | null }) => {
      if (data.item === null) {
        return {
          workId: data.workId,
          item: null,
        };
      }
      const x = plainToClass(BaseWork, data.item) as BaseWork;
      x.workId = data.workId;
      return {
        workId: data.workId,
        item: x,
      };
    }
  ),
  readingListFetch: create<Map<number, PlainWork>>()(
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
    (conflict: SyncConflict) => ({
      conflict: classToPlain(conflict),
    }),
    (data) => {
      return SyncConflict.fromPlain(data.conflict);
    }
  ),
  readingListSyncMissingDataWarning: create<'force' | 'blank' | 'abort'>()(
    'readingListSyncMissingDataWarning',
    (count: number) => ({ count }),
    (data) => data
  ),
};
