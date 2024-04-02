import type * as clsx from 'clsx'
import type { JSX as JSX_ } from 'preact'

declare module 'preact' {
  namespace JSX {
    interface HTMLAttributes<RefType extends EventTarget = EventTarget> {
      classNames?: clsx.ClassValue | clsx.ClassArray
    }
  }
}

declare global {
  namespace JSX {
    interface Element extends HTMLElement, SVGElement, DocumentFragment {
      addEventListener: HTMLElement['addEventListener']
      removeEventListener: HTMLElement['removeEventListener']
      className: HTMLElement['className']
    }

    interface IntrinsicElements extends JSX_.IntrinsicElements { }
    interface HTMLAttributes<RefType extends EventTarget = EventTarget> extends JSX_.HTMLAttributes<RefType> { }
    interface SVGAttributes<Target extends EventTarget = SVGElement> extends JSX_.SVGAttributes<Target> { }
  }
}