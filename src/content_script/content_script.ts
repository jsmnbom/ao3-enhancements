import { debounce } from '@antfu/utils'

import { ADDON_CLASS, api, logger, options, toast } from '#common'

import type { Unit } from './Unit.ts'

import { UNITS } from './units/index.ts'
import { addThemeClass, getTag, ready } from './utils.tsx'

/**
 * Clears any old DOM elements added by the extension.
 */
async function clean(units: Unit[]) {
  addThemeClass(true)
  for (const unit of units)
    await unit.clean()

  const toRemove = document.querySelectorAll(`.${ADDON_CLASS}`)
  if (toRemove) {
    logger.debug('Removing old elements: ', toRemove)
    toRemove.forEach((el) => {
      el.remove()
    })
  }
}

async function run() {
  const opts = await options.get()
  const units = UNITS.map(U => new U(opts))

  await ready()
  logger.debug('Ready!')

  const enabledUnits = units.filter(u => u.enabled)
  logger.info('Enabled units:', enabledUnits.map(u => u.name))

  await clean(units)

  addThemeClass()

  for (const unit of enabledUnits)
    await unit.ready()
}

const debouncedRun = debounce(500, () => {
  run().catch((err) => {
    logger.error(err)
  })
})

options.addListener(() => {
  logger.info('Options have changed, reloading.')
  debouncedRun()
})

api.getTag.addListener(async (linkUrl) => {
  return getTag(linkUrl)
})

api.toast.addListener(async (...args) => {
  toast(...args)
})

run().catch((err) => {
  logger.error(err)
})
