import { deserializeError, serializeError } from 'serialize-error'

import { createLogger } from './logger.js'
import type { Tag } from './options.js'

// const logger = createLogger('API')

// class APIMethod<
//   Send extends Array<unknown>,
//   Reply,
//   Data extends Record<string, unknown>,
//   Receive,
//   MsgType extends string,
//   Callback extends (
//     arg: Receive,
//     sender?: browser.runtime.MessageSender
//   ) => Promise<Reply>,
// > {
//   private _callbacks: Array<Callback> = []
//   private boundCallback: typeof APIMethod.prototype.callback

//   constructor(
//     private readonly msgType: MsgType,
//     private readonly sendData: (...args: Send) => Data,
//     private readonly receiveData: (data: Data) => Receive,
//   ) {
//     this.boundCallback = this.callback.bind(this) as typeof APIMethod.prototype.callback
//   }

//   private send(sender: () => Promise<Reply>): Promise<Reply> {
//     return sender().catch((e) => {
//       if (e instanceof Error) {
//         if (e.message.startsWith('||')) {
//           const error = deserializeError(JSON.parse(e.message.slice(2)))
//           throw error
//         }
//       }
//       throw e
//     })
//   }

//   public async sendToBackground(...args: Send): Promise<Reply> {
//     return this.send(async () =>
//       (await browser.runtime.sendMessage({
//         [this.msgType]: this.sendData(...args),
//       })) as Reply,
//     )
//   }

//   public async sendToTab(tabId: number, frameId: number, ...args: Send) {
//     return this.send(async () =>
//       (await browser.tabs.sendMessage(
//         tabId,
//         { [this.msgType]: this.sendData(...args) },
//         { frameId },
//       )) as Reply,
//     )
//   }

//   public addListener(callback: Callback): void {
//     this._callbacks.push(callback)
//     if (!browser.runtime.onMessage.hasListener(this.boundCallback))
//       browser.runtime.onMessage.addListener(this.boundCallback)
//   }

//   public removeListener(callback: Callback): void {
//     this._callbacks = this._callbacks.filter(cb => cb !== callback)
//   }

//   private callback(
//     msg: { [msgType in MsgType]: Data },
//     sender: browser.runtime.MessageSender,
//   ): Promise<Reply> | false {
//     if (msg[this.msgType]) {
//       const data = this.receiveData(msg[this.msgType])
//       for (const callback of this._callbacks) {
//         return callback(data, sender).catch((e) => {
//           logger.error(
//             `Error in api.${this.msgType} callback. Sender:`,
//             sender,
//             e,
//           )
//           // Put error type into message, to preserve it across the IPC
//           if (e instanceof Error)
//             e = new Error(`||${JSON.stringify(serializeError(e))}`)

//           return Promise.reject(e)
//         })
//       }
//     }
//     return false
//   }
// }
// function create<Reply>() {
//   return function <
//     Send extends Array<unknown>,
//     Data extends Record<string, unknown>,
//     Receive,
//     MsgType extends string,
//     Callback extends (
//       arg: Receive,
//       sender?: browser.runtime.MessageSender
//     ) => Promise<Reply>,
//   >(
//     msgType: MsgType,
//     sendData: (...args: Send) => Data,
//     receiveData: (data: Data) => Receive,
//   ): APIMethod<Send, Reply, Data, Receive, MsgType, Callback> {
//     return new APIMethod<Send, Reply, Data, Receive, MsgType, Callback>(
//       msgType,
//       sendData,
//       receiveData,
//     )
//   }
// }

// export const api = {
//   getTag: create<Tag>()(
//     'getTag',
//     (linkUrl: string) => ({ linkUrl }),
//     (data: { linkUrl: string }) => data.linkUrl,
//   ),
// }

type Callback<Fn extends (...args: any) => Promise<any>> = (...args: Parameters<Fn>) => Promise<ReturnType<Awaited<Fn>> | void>

class APIMethod<Name extends string, Fn extends (...args: any) => Promise<any>> {
  private _callbacks: Array<Callback<Fn>> = []
  private boundCallback: (msg: any, sender: browser.runtime.MessageSender) => Promise<any> | false

  constructor(private readonly name: Name) {
    // eslint-disable-next-line ts/no-unsafe-assignment
    this.boundCallback = this.callback.bind(this)
  }

  async sendToBackground(...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>> {
    // eslint-disable-next-line ts/no-unsafe-return
    return await browser.runtime.sendMessage({ [this.name]: args })
  }

  async sendToTab(tabId: number, frameId: number, ...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>> {
    // eslint-disable-next-line ts/no-unsafe-return
    return await browser.tabs.sendMessage(tabId, { [this.name]: args }, { frameId })
  }

  addListener(cb: Callback<Fn>): void {
    this._callbacks.push(cb)
    this.attachCallback()
  }

  removeListener(cb: Callback<Fn>): void {
    this._callbacks = this._callbacks.filter(c => c !== cb)
    this.attachCallback()
  }

  hasListener(cb: Callback<Fn>): boolean {
    return this._callbacks.includes(cb)
  }

  private attachCallback() {
    if (this._callbacks.length && !browser.runtime.onMessage.hasListener(this.boundCallback))
      browser.runtime.onMessage.addListener(this.boundCallback)
    else if (!this._callbacks.length && browser.runtime.onMessage.hasListener(this.boundCallback))
      browser.runtime.onMessage.removeListener(this.boundCallback)
  }

  private async callback(msg: any, sender: browser.runtime.MessageSender): Promise<ReturnType<Awaited<Fn>> | void> {
    if (msg && typeof msg === 'object' && this.name in msg) {
      // eslint-disable-next-line ts/no-unsafe-member-access
      const data = msg[this.name] as Parameters<Fn>
      for (const callback of this._callbacks) {
        const result = await callback(...data)
        if (result)
          // eslint-disable-next-line ts/no-unsafe-return
          return result as ReturnType<Awaited<Fn>>
      }
    }
  }
}

function createAPI<const API extends { [k: string]: (...args: any) => Promise<any> }>() {
  return new Proxy({} as { [k: string]: APIMethod<string, any> }, {
    get(api, prop: string) {
      return api[prop] ??= new APIMethod<typeof prop, API[typeof prop]>(prop)
    },
  }) as {
    [K in keyof API]: K extends string ? APIMethod<K, API[K]> : never
  }
}

export const api = createAPI<{
  getTag: (linkUrl: string) => Promise<Tag>
  openOptionsPage: () => Promise<void>
}>()
