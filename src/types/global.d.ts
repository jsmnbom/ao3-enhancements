import type { GlobalComponents } from 'vue'

declare global {
  type Ref<T = any> = import('vue').Ref<T>

  type ComponentInstance = {
    [Property in keyof GlobalComponents]: InstanceType<GlobalComponents[Property]>
  }
}
