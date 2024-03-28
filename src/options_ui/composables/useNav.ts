import { useIntersectionObserver } from '@vueuse/core'
import type { ComputedRef, VNode } from 'vue'
import { computed, getCurrentInstance, onMounted, onUnmounted, ref, watch } from 'vue'

import { useSize } from './useSize.js'

export interface NavItem {
  name: string
  ref: HTMLElement
  active?: ComputedRef<boolean> | boolean
}

const nav = ref<NavItem[]>([])
const intersectionMap = ref(new Map<string, boolean>())

export function useNav() {
  return {
    nav,
  }
}

export function useAddNav(name: string) {
  onMounted(() => {
    const ref = (getCurrentInstance()?.vnode as VNode<HTMLElement>).el
    if (!ref)
      return

    const item: NavItem = {
      name,
      ref,
      active: computed(() => {
        for (const item of nav.value) {
          if (intersectionMap.value.get(item.name))
            return item.name === name
        }
        return false
      }),
    }

    nav.value.push(item as any)

    const headerSize = useSize('header')
    let stop: (() => void) | undefined

    watch(() => headerSize.height.value, () => {
      stop?.()

      stop = useIntersectionObserver(
        ref,
        ([{ isIntersecting }]) => {
          intersectionMap.value.set(name, isIntersecting)
        },
        {
          threshold: [0, 0.1, 0.9, 1.0],
          rootMargin: `-${headerSize.height.value + 16}px 0px 0px 0px`,
        },
      ).stop
    })

    onUnmounted(() => {
      nav.value = nav.value.filter(item => item.name !== name)
      stop?.()
    })
  })
}
