import type { Tag } from './data.ts'
import type { toast } from './toast/toast.tsx'

type Callback<Fn extends (...args: any) => Promise<any>> = (...args: Parameters<Fn>) => Promise<Awaited<ReturnType<Fn>> | void>

class APIMethod<Name extends string, Fn extends (...args: any) => Promise<any>> {
  #callbacks: Array<Callback<Fn>> = []
  #boundCallback: typeof APIMethod.prototype.callback

  constructor(private readonly name: Name) {
    this.#boundCallback = this.callback.bind(this)
  }

  async sendToBackground(...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>> {
    return await browser.runtime.sendMessage({ [this.name]: args })
  }

  async sendToTab(frame: { tabId: number, frameId: number }, ...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>>
  async sendToTab(tabId: number, ...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>>
  async sendToTab(tabIdOrFrame: number | { tabId: number, frameId: number }, ...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>> {
    const tabId = typeof tabIdOrFrame === 'number' ? tabIdOrFrame : tabIdOrFrame.tabId
    const frameId = typeof tabIdOrFrame === 'number' ? undefined : tabIdOrFrame.frameId

    return await browser.tabs.sendMessage(tabId, { [this.name]: args }, { frameId })
  }

  addListener(cb: Callback<Fn>): void {
    this.#callbacks.push(cb)
    this.attachCallback()
  }

  removeListener(cb: Callback<Fn>): void {
    this.#callbacks = this.#callbacks.filter(c => c !== cb)
    this.attachCallback()
  }

  hasListener(cb: Callback<Fn>): boolean {
    return this.#callbacks.includes(cb)
  }

  private attachCallback() {
    if (this.#callbacks.length && !browser.runtime.onMessage.hasListener(this.#boundCallback))
      browser.runtime.onMessage.addListener(this.#boundCallback)
    else if (!this.#callbacks.length && browser.runtime.onMessage.hasListener(this.#boundCallback))
      browser.runtime.onMessage.removeListener(this.#boundCallback)
  }

  private callback(msg: any, _sender: browser.runtime.MessageSender, sendResponse: (response?: any) => void): boolean {
    // Chrome doesn't support promise responses, refactor when https://issues.chromium.org/issues/40753031 is fixed
    void (async () => {
      if (msg && typeof msg === 'object' && this.name in msg) {
        const data = msg[this.name] as Parameters<Fn>
        for (const callback of this.#callbacks) {
          const result = await callback(...data)
          if (result) {
            sendResponse(result)
            return
          }
        }
      }
    })()
    return true
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

export const api = /* @__PURE__ */ createAPI<{
  getTag: (linkUrl: string) => Promise<Tag>
  toast: (...args: Parameters<typeof toast>) => Promise<void>
  openOptionsPage: () => Promise<void>
}>()
