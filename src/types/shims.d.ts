declare const attributesSymbol: unique symbol

type UnoAttribute = any

type Attributes = {
  [key in string]: UnoAttribute
}

declare module '@vue/runtime-dom' {
  interface HTMLAttributes extends Attributes {}
}
declare module '@vue/runtime-core' {
  interface AllowedComponentProps extends Attributes {}
}

export {}
