/* eslint-disable ts/no-unsafe-argument, ts/no-unsafe-member-access, ts/no-namespace */
import type { JSX as JSXInternal } from 'preact'

declare global {
  namespace JSX {
    interface Element extends HTMLElement, SVGElement, DocumentFragment {
      addEventListener: HTMLElement['addEventListener']
      removeEventListener: HTMLElement['removeEventListener']
      className: HTMLElement['className']
    }

    interface IntrinsicElements extends JSXInternal.IntrinsicElements { }
    interface HTMLAttributes<RefType extends EventTarget = EventTarget> extends JSXInternal.HTMLAttributes<RefType> { }
    interface SVGAttributes<Target extends EventTarget = SVGElement> extends JSXInternal.SVGAttributes<Target> { }

  }
}

// https://github.com/wooorm/svg-tag-names/blob/main/index.js
const SVG_TAGS = 'svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view'.split(',')
const isSVGTag = (tag: string): boolean => SVG_TAGS.includes(tag)
// https://github.com/preactjs/preact/blob/1bbd687c13c1fd16f0d6393e79ea6232f55fbec4/src/constants.js#L3
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i

type Attributes = JSX.IntrinsicElements['div']
type DocumentFragmentConstructor = typeof DocumentFragment
type ElementFunction = ((props?: any) => HTMLElement | SVGElement) & {
  defaultProps?: any
}

function isFragment(type: DocumentFragmentConstructor | ElementFunction): type is DocumentFragmentConstructor {
  return type === DocumentFragment
}

function setCSSProps(element: HTMLElement | SVGElement, style: CSSStyleDeclaration): void {
  for (const [name, value] of Object.entries(style)) {
    if (name.startsWith('-'))
      element.style.setProperty(name, value)
    else if (typeof value === 'number' && !IS_NON_DIMENSIONAL.test(name))
      element.style[name as any] = `${value as string}px`
    else
      element.style[name as any] = value
  }
}

function create(type: HTMLElement | SVGElement | DocumentFragmentConstructor | ElementFunction | string): HTMLElement | SVGElement | DocumentFragment {
  if (type instanceof HTMLElement || type instanceof SVGElement)
    return type.cloneNode(true) as HTMLElement | SVGElement

  if (typeof type === 'string') {
    if (isSVGTag(type))
      return document.createElementNS('http://www.w3.org/2000/svg', type)

    return document.createElement(type)
  }

  if (isFragment(type))
    return document.createDocumentFragment()

  return type(type.defaultProps)
}

function setAttribute(element: HTMLElement | SVGElement, name: string, value: string): void {
  if (value === undefined || value === null)
    return
  element.setAttribute(name, value)
}

function addChildren(parent: Element | DocumentFragment, children: Node[]): void {
  for (const child of children) {
    if (child instanceof Node)
      parent.appendChild(child)
    else if (Array.isArray(child))
      addChildren(parent, child)
    else if (
      typeof child !== 'boolean'
      && typeof child !== 'undefined'
      && child !== null
    )
      parent.appendChild(document.createTextNode(child))
  }
}

// These attributes allow "false" as a valid value
// https://github.com/facebook/react/blob/3f8990898309c61c817fbf663f5221d9a00d0eaa/packages/react-dom/src/shared/DOMProperty.js#L288-L322
const booleanishAttributes = new Set([
  // These attributes allow "false" as a valid value
  'contentEditable',
  'draggable',
  'spellCheck',
  'value',
  // SVG-specific
  'autoReverse',
  'externalResourcesRequired',
  'focusable',
  'preserveAlpha',
])

export function h(type: HTMLElement | SVGElement | DocumentFragmentConstructor | ElementFunction | string, attributes?: Attributes, ...children: Node[]): Element | DocumentFragment {
  const element = create(type)

  addChildren(element, children)

  if (element instanceof DocumentFragment || !attributes)
    return element

  // Set attributes
  for (let [name, value] of Object.entries(attributes)) {
    if (name === 'htmlFor')
      name = 'for'

    if (name === 'class' || name === 'className') {
      setAttribute(
        element,
        'class',
        (`${element.getAttribute('class') ?? ''} ${String(value)}`).trim(),
      )
    }
    else if (name === 'style' && value instanceof Object) {
      setCSSProps(element, value)
    }
    else if (name.startsWith('on')) {
      const eventName = name.slice(2).toLowerCase().replace(/^-/, '')
      element.addEventListener(eventName, value)
    }
    else if (name !== 'key' && (booleanishAttributes.has(name) || value !== false)) {
      setAttribute(element, name, value === true ? '' : value)
    }
  }

  return element
}

export const Fragment = (typeof DocumentFragment === 'function' ? DocumentFragment : () => {}) as {
  prototype: DocumentFragment
  new(): DocumentFragment
}

// Improve TypeScript support for DocumentFragment
// https://github.com/Microsoft/TypeScript/issues/20469
const React = {
  createElement: h,
  Fragment,
}

// Improve CJS support
export const createElement = h

export default React
