import type { ToRefs } from 'vue'

import { debounce, objectEntries } from '@antfu/utils'

import type { Options } from '#common'

import { createLogger, deepToRaw, options, toast } from '#common'

const logger = createLogger('useOptions')

let loading = true
let saving = false
const ready = ref(false)
const scope = effectScope(true)
const allOptions = reactive(options.defaults) as Options
const changedOptions: Set<options.Id> = new Set()

const save = debounce(200, () => {
  if (loading)
    return false

  const toSet = Array.from(changedOptions).map(key => [key, deepToRaw(allOptions[key])])
  logger.log('Saving:', Object.fromEntries(toSet))
  changedOptions.clear()

  saving = true
  void options.set(Object.fromEntries(toSet)).then(() => {
    toast('Options saved', { type: 'success' })
    setTimeout(() => saving = false, 100)
  })
})

function update(id: options.Id) {
  if (loading)
    return false

  logger.log('Update:', id)
  changedOptions.add(id)
  save()
}

function assign(id: options.Id, value: Options[options.Id] | undefined) {
  if (isReactive(allOptions[id])) {
    if (value === undefined)
      return

    Object.assign(allOptions[id], value)
  }
  else {
    (allOptions[id] as any) = value
  }
}

export function useOption<K extends options.Id>(id: K): Options[K] extends object ? ToRefs<Options[K]> : Ref<Options[K]> {
  const val = allOptions[id] as object

  return isReactive(val) ? toRefs(val) : toRef(allOptions, id) as any
}

export function useOptionsReady() {
  return ready
}

function externalListener(change: Partial<Options>) {
  if (saving || loading)
    return

  loading = true
  logger.info('[external] change:', change)

  for (const [id, value] of objectEntries(change))
    assign(id, value)

  setTimeout(() => loading = false, 100)
}

function load() {
  loading = true
  logger.log('Loading...')

  void options.get().then((opts) => {
    scope.run(() => {
      for (const [id, value] of objectEntries(opts)) {
        assign(id, value)
        watch(() => allOptions[id], () => update(id), { deep: true })
      }

      logger.log('[external] Attaching listener')
      options.addListener(externalListener)
      onScopeDispose(() => options.removeListener(externalListener))

      ready.value = true
      logger.log('Ready!')

      void nextTick(() => loading = false)
    })
  })
}

if (import.meta.hot) {
  logger.log('[hot] Available!')
  import.meta.hot.on('vite:beforeUpdate', () => {
    logger.log('[hot] Disposing...')
    scope.stop()
  })
}

load()
