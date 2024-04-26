type UnoAttribute = any

type Attributes = Record<string, UnoAttribute>
type ComponentAttributes = Record<(string & Record<never, never>), UnoAttribute>

declare module '@vue/runtime-dom' {
  interface HTMLAttributes extends Attributes {}
}

declare module '@vue/runtime-core' {
  interface AllowedComponentProps extends ComponentAttributes {}
}

export {}
