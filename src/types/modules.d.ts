declare module '*.vue' {
  import type { ComponentOptions } from 'vue'

  const component: ComponentOptions
  export default component
}

declare module '~icons/*.jsx' {
  const component: (props: JSX.SVGAttributes<SVGSVGElement>) => JSX.Element
  export default component
}
