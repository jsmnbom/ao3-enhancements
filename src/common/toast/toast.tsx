import React from '#dom'

import style from './toast.css?inline'

export interface ToastOptions {
  timeout?: number
  type?: 'success' | 'error'
}

let toastContainer: HTMLElement | null = null
const instances = new Set<Toast>()

function getContainer() {
  if (toastContainer)
    return toastContainer

  const wrapper = (<div />)
  const shadow = wrapper.attachShadow({ mode: 'open' })

  const sheet = new CSSStyleSheet()
  sheet.replaceSync(style)

  // @ts-expect-error https://bugzilla.mozilla.org/show_bug.cgi?id=1817675
  // eslint-disable-next-line ts/no-unsafe-call, ts/no-unsafe-member-access
  process.env.BROWSER === 'firefox' && 'wrappedJSObject' in shadow ? shadow.wrappedJSObject.adoptedStyleSheets.push(sheet) : shadow.adoptedStyleSheets = [sheet]

  toastContainer = (
    <div
      class="container"
      onMouseEnter={() => instances.forEach(toast => toast.stop())}
      onMouseLeave={() => instances.forEach(toast => toast.start())}
    />
  )

  shadow.appendChild(toastContainer)
  document.body.appendChild(wrapper)
  return toastContainer
}

// Loosely based on https://github.com/2nthony/vercel-toast
class Toast {
  readonly el: HTMLElement
  private readonly timeout: number
  private readonly type: ToastOptions['type']
  private timeoutId: number | null = null

  constructor(message: string, { timeout = 5000, type }: ToastOptions = {}) {
    this.el = (
      <div
        class="toast"
        data-type={type}
        aria-live="polite"
        aria-atomic="true"
        aria-role="alert"
      >
        <div class="inner">
          <div class="text">
            {message}
          </div>
        </div>
      </div>
    )
    this.timeout = timeout
    this.type = type

    instances.add(this)
    console.log(this)
  }

  show() {
    getContainer().appendChild(this.el)

    this.start()

    setTimeout(sortToast, 50)
  }

  hide(): void {
    const { el } = this
    if (!el)
      return

    el.style.opacity = '0'
    el.style.visibility = 'hidden'
    el.style.transform = 'translateY(10px)'

    this.stop()

    setTimeout(() => {
      getContainer().removeChild(el)
      instances.delete(this)
      sortToast()
    }, 150)
  }

  stop() {
    if (this.timeoutId !== null)
      window.clearTimeout(this.timeoutId)
  }

  start() {
    this.timeoutId = window.setTimeout(() => this.hide(), this.timeout)
  }
}

export function toast(message: string, options?: ToastOptions) {
  new Toast(message, options).show()
}

function sortToast(): void {
  const toasts = Array.from(instances).reverse().slice(0, 4)

  const heights: Array<number> = []

  toasts.forEach((toast, index) => {
    const sortIndex = index + 1
    const el = toast.el as HTMLDivElement
    const height = +(el.getAttribute('data-height') || 0) || el.clientHeight

    heights.push(height)

    el.className = `toast toast-${sortIndex}`
    el.dataset.height = `${height}`
    el.style.setProperty('--index', `${sortIndex}`)
    el.style.setProperty('--height', `${height}px`)
    el.style.setProperty('--front-height', `${heights[0]}px`)

    if (sortIndex > 1) {
      const hoverOffsetY = heights
        .slice(0, sortIndex - 1)
        .reduce((res, next) => (res += next), 0)
      el.style.setProperty('--hover-offset-y', `-${hoverOffsetY}px`)
    }
    else {
      el.style.removeProperty('--hover-offset-y')
    }
  })
}
