import { debounce, objectKeys } from '@antfu/utils'
import type { ToRefs } from 'vue'
import { toast } from 'vue-sonner'

import type { Options } from '#common'
import { options } from '#common'

enum Phase {
  None,
  Loading,
  Ready,
}

let phase: Phase = Phase.None
let allOptions: ToRefs<Options>
let changedOptions: options.Id[] = []

const save = debounce(500, () => {
  const toSet = changedOptions.map(key => [key, allOptions[key].value])
  changedOptions = []
  void options.set(Object.fromEntries(toSet)).then(() => {
    toast.success('Options saved')
  })
})

function update(id: options.Id) {
  if (phase !== Phase.Ready)
    return
  changedOptions.push(id)
  save()
}

function setup() {
  if (phase !== Phase.None)
    return
  phase = Phase.Loading

  allOptions = toRefs(reactive(options.DEFAULT))

  void options.get(options.ALL).then((opts) => {
    for (const key of objectKeys(opts))
      allOptions[key].value = opts[key]
    void nextTick(() => {
      phase = Phase.Ready
    })
  })
}

export function useOption<K extends options.Id>(id: K): Ref<Options[K]> {
  setup()
  watch(allOptions[id], () => update(id), { deep: true })
  return allOptions[id]
}
