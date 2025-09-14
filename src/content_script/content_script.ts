import { debounce } from '@antfu/utils'

import { ADDON_CLASS, api, logger, options, toast } from '#common'

import { UNITS } from './units/index.ts'
import { getTag } from './utils.tsx'

/**
 * Clears any old DOM elements added by the extension.
 */
async function clean() {
  logger.info('Cleaning up...')

  await Promise.all(UNITS.map(u => u.clean()))

  const toRemove = document.querySelectorAll(`.${ADDON_CLASS}`)
  if (toRemove.length) {
    logger.debug('Removing old elements: ', toRemove)
    toRemove.forEach((el) => {
      el.remove()
    })
  }
}

async function run() {
  const opts = await options.get()
  const units = UNITS.map(U => new U(opts))
  const enabled = units.filter(u => u.enabled)

  logger.info('Enabled units:', enabled.map(u => u.name))

  if (document.readyState !== 'loading') {
    await clean()
  }
  else {
    await waitForReady()
  }

  await Promise.all(enabled.map(u => u.ready()))
}

function waitForReady(): Promise<void> {
  return new Promise((resolve) => {
    document.addEventListener('DOMContentLoaded', () => resolve())
  })
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
