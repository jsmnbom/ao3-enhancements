import type { Tag } from './options.ts'

type Callback<Fn extends (...args: any) => Promise<any>> = (...args: Parameters<Fn>) => Promise<Awaited<ReturnType<Fn>> | void>

class APIMethod<Name extends string, Fn extends (...args: any) => Promise<any>> {
  private _callbacks: Array<Callback<Fn>> = []
  private boundCallback: (msg: any, sender: browser.runtime.MessageSender) => Promise<any> | false

  constructor(private readonly name: Name) {
    this.boundCallback = this.callback.bind(this)
  }

  async sendToBackground(...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>> {
    // eslint-disable-next-line ts/no-unsafe-return
    return await browser.runtime.sendMessage({ [this.name]: args })
  }

  async sendToTab(frame: { tabId: number, frameId: number }, ...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>>
  async sendToTab(tabId: number, ...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>>
  async sendToTab(tabIdOrFrame: number | { tabId: number, frameId: number }, ...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>> {
    const tabId = typeof tabIdOrFrame === 'number' ? tabIdOrFrame : tabIdOrFrame.tabId
    const frameId = typeof tabIdOrFrame === 'number' ? undefined : tabIdOrFrame.frameId
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

  private async callback(msg: any, _sender: browser.runtime.MessageSender): Promise<ReturnType<Awaited<Fn>> | void> {
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
