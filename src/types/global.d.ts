declare global {
  type Ref<T = any> = import('vue').Ref<T>
  type ToRefs<T = any> = import('vue').ToRefs<T>
  type ToRef<T> = import('vue').ToRef<T>
  type ComputedRef<T = any> = import('vue').ComputedRef<T>
  type ComponentPublicInstance = import('vue').ComponentPublicInstance
  type PropType<T> = import('vue').PropType<T>
  type InjectionKey<T> = import('vue').InjectionKey<T>
  type ExtractPropTypes<T> = import('vue').ExtractPropTypes<T>
  type VNode<HostNode = import('vue').RendererNode, HostElement = import('vue').RendererElement, ExtraProps = { [key: string]: any }> = import('vue').VNode<HostNode, HostElement, ExtraProps>
}

export {}
