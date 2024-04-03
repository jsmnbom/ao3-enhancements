import { kebabCase } from 'change-case'

export interface NavItem {
  name: string
  ref: HTMLElement
  id: string
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
  const id = ref(kebabCase(name))

  onMounted(() => {
    const el = (getCurrentInstance()?.vnode as VNode<HTMLElement>).el
    if (!el)
      return

    const item: NavItem = {
      name,
      ref: el,
      id: id.value,
      active: computed(() => {
        for (const item of nav.value) {
          if (intersectionMap.value.get(item.name))
            return item.name === name
        }
        return false
      }),
    }

    nav.value.push(item as any)

    const headerHeightInPx = useLayoutVar('--header-height')
    let stop: (() => void) | undefined

    watch(headerHeightInPx, () => {
      stop?.()

      const offset = (Number.parseInt(headerHeightInPx.value, 10) || 0) * 2

      stop = useIntersectionObserver(
        el,
        ([{ isIntersecting }]) => {
          intersectionMap.value.set(name, isIntersecting)
        },
        {
          threshold: [0, 0.1, 0.9, 1.0],
          rootMargin: `-${offset}px 0px 0px 0px`,
        },
      ).stop
    }, { immediate: true })

    onUnmounted(() => {
      nav.value = nav.value.filter(item => item.name !== name)
      stop?.()
    })
  })

  return {
    id,
  }
}
