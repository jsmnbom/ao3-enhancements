import path from 'node:path'
import process from 'node:process'
import util from 'node:util'

import { BROWSERS } from '../../src/manifest.js'

import { createAsset } from './Asset.js'
import { BUILD_DIR, COMMANDS, SRC_DIR } from './constants.js'

function parseArgs() {
  const { positionals: args, values: options } = util.parseArgs({
    options: {
      development: { type: 'boolean', short: 'D' },
      browser: { type: 'string', short: 'b' },
    },
    allowPositionals: true,
  } as const)

  if (!options.browser)
    throw new Error('Must specify exactly one --browser')
  if (options.browser && !BROWSERS.includes(options.browser))
    throw new Error('Unknown browser')

  if (args.length !== 1)
    throw new Error('Must specify exactly one command')

  if (!COMMANDS.includes(args[0] as typeof COMMANDS[number]))
    throw new Error('Unknown command')

  return {
    development: options.development ?? false,
    browser: options.browser,
    command: args[0] as typeof COMMANDS[number],
  }
}

async function main() {
  const { development, browser, command } = parseArgs()

  process.env.NODE_ENV = development ? 'development' : 'production'

  const build_dir = path.join(BUILD_DIR, browser)
  console.log('d')
  const manifest = createAsset(path.join(SRC_DIR, 'manifest.ts'), { browser, dist_dir: build_dir }, { type: 'manifest' })

  if (command === 'build')
    await manifest.build().then(() => manifest.logDone())
  else if (command === 'watch')
    await manifest.watch().then(() => manifest.logDone())
}

await main()
