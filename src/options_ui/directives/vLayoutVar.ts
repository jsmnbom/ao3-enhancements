import type { ObjectDirective } from 'vue'

interface Binding {
  height?: string
  width?: string
}

const layoutVaribles = ref(new Map<string, string>())

export const vLayoutVar: ObjectDirective<HTMLElement, Binding> = {
  mounted(el, binding) {
    const size = useElementSize(el, undefined, { box: 'border-box' })

    for (const [key, name] of Object.entries(binding.value) as [keyof Binding, string][]) {
      const variable = useLayoutVar(name)
      watch(size[key], () => variable.value = `${size[key].value}px`, { immediate: true })
    }
  },
}

export function useLayoutVar(name: string) {
  return computed({
    get: () => layoutVaribles.value.get(name) ?? '0px',
    set: (value: string) => {
      layoutVaribles.value.set(name, value)
      document.documentElement.style.setProperty(name, value)
    },
  })
}
