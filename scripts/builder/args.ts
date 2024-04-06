import { join, resolve } from 'node:path'
import process from 'node:process'
import util from 'node:util'

export type Args = ReturnType<typeof _parseArgs>

export const COMMANDS = ['build', 'serve'] as const
export const BROWSERS = ['chrome', 'firefox'] as const
export type Browser = typeof BROWSERS[number]

export function parseArgs(): Args {
  return _parseArgs()
}

function _parseArgs() {
  const { positionals: args = ['serve'], values: options } = util.parseArgs({
    options: {
      development: { type: 'boolean', short: 'D' },
      browser: { type: 'string', short: 'b' },
      verbose: { type: 'boolean', short: 'v' },
    },
    allowPositionals: true,
  } as const)

  if (!options.browser)
    throw new Error('Must specify a browser')
  if (options.browser && !BROWSERS.includes(options.browser as typeof BROWSERS[number]))
    throw new Error('Unknown browser')
  if (args.length !== 1)
    throw new Error('Must specify exactly one command')
  if (!COMMANDS.includes(args[0] as typeof COMMANDS[number]))
    throw new Error('Unknown command')

  process.env.NODE_ENV = options.development ? 'development' : 'production'

  return {
    browser: options.browser as typeof BROWSERS[number],
    command: args[0] as typeof COMMANDS[number],
    development: options.development ?? false,
    verbose: options.verbose ?? false,
    root: resolve('.'),
    src: resolve('src'),
    dist: join(resolve('dist'), options.browser),
    manifest: resolve('src/manifest.ts'),
  }
}
