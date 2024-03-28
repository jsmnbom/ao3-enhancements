import { debounce } from '@antfu/utils'

import { ADDON_CLASS, logger, options } from '#common'
import type { Unit } from '#common'

import { UNITS } from './units/index.js'
import { addThemeClass, getTag, ready } from './utils.js'

// api.getTag.addListener(async (linkUrl) => {
//   return getTag(linkUrl);
// });

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
  const opts = await options.get(options.ALL)
  logger.verbose = opts.verbose

  const units = UNITS.map(U => new U(opts))

  await ready()
  logger.debug('Ready!')

  const enabledUnits = units.filter(u => u.enabled)
  logger.info('Enabled units:', enabledUnits.map(u => u.constructor.name))

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

browser.storage.onChanged.addListener((changes, areaName) => {
  if (
    areaName === 'local'
    && Object.keys(changes).some(key => key.startsWith('option.'))
  ) {
    logger.info('Options have changed, reloading.')
    debouncedRun()
  }
})

run().catch((err) => {
  logger.error(err)
})
