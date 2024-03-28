import { syncRef, useElementSize } from '@vueuse/core'
import type { Ref, VNode } from 'vue'
import { getCurrentInstance, ref } from 'vue'

type SizeKey = 'header' | 'footer'
const sizeMap = new Map<SizeKey, { height: Ref<number>, width: Ref<number> }>()

export function useSize(key: string) {
  const { height, width } = sizeMap.get(key as SizeKey) || (() => {
    const height = ref(0)
    const width = ref(0)
    sizeMap.set(key as SizeKey, { height, width })
    return { height, width }
  })()

  return {
    height,
    width,
    set: (ref?: HTMLElement | null) => {
      if (!ref)
        ref = (getCurrentInstance()?.vnode as VNode<HTMLElement>).el
      if (!ref)
        return

      const { height, width } = useElementSize(ref, undefined, { box: 'border-box' })
      syncRef(height, sizeMap.get(key as SizeKey)!.height)
      syncRef(width, sizeMap.get(key as SizeKey)!.width)
    },
  }
}
