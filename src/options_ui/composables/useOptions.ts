import { debounce } from '@antfu/utils'
import { toast } from 'vue-sonner'

import type { Options } from '#common'
import { options } from '#common'

const ready = ref(false)
const allOptions = reactive(options.DEFAULT)
const changedOptions: Set<options.Id> = new Set()

const save = debounce(200, () => {
  const toSet = Array.from(changedOptions).map(key => [key, allOptions[key]])
  changedOptions.clear()
  void options.set(Object.fromEntries(toSet)).then(() => {
    toast.success('Options saved')
  })
})

function update(id: options.Id) {
  if (!ready.value)
    return false
  changedOptions.add(id)
  save()
}

export function useOption<K extends options.Id>(id: K): Ref<Options[K]> {
  watch(() => allOptions[id], () => update(id), { deep: true })
  return toRef(allOptions, id)
}

export function useOptionsReady() {
  return ready
}

void options.get(options.ALL).then((opts) => {
  Object.assign(allOptions, opts)
  void nextTick(() => {
    ready.value = true
  })
})
