import { join, resolve } from 'node:path'

import { Command, Option } from '@commander-js/extra-typings'

export type Args = ReturnType<typeof _parseArgs>

export const COMMANDS = ['build', 'serve'] as const
export const BROWSERS = ['chrome', 'firefox'] as const
export type Browser = typeof BROWSERS[number]

export function parseArgs(): Args {
  return _parseArgs()
}

function _parseArgs() {
  const program = new Command()
    .name('build.ts')
    .addOption(new Option('-b, --browser <browser>', 'browser to build for').choices(BROWSERS).makeOptionMandatory().default(process.env.BROWSER))
    .addOption(new Option('-D, --development', 'enable development mode').default(process.env.NODE_ENV === 'development'))
    .addOption(new Option('-v, --verbose', 'enable verbose logging').default(false))
    .parse()

  const options = program.opts()
  const args = program.args

  if (args.length !== 1)
    throw new Error('Must specify exactly one command')

  process.env.NODE_ENV = options.development ? 'development' : (process.env.NODE_ENV ?? 'production')
  process.env.BROWSER = options.browser

  return {
    command: args[0] as typeof COMMANDS[number],
    root: resolve('.'),
    src: resolve('src'),
    dist: join(resolve('dist'), options.browser),
    manifest: resolve('src/manifest.ts'),
    ...options,
  }
}
