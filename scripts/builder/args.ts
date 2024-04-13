import { join, resolve } from 'node:path'
import * as util from 'node:util'

export type Args = ReturnType<typeof _parseArgs>

export const COMMANDS = ['build', 'serve'] as const
export const BROWSERS = ['chrome', 'firefox'] as const
export type Command = typeof COMMANDS[number]
export type Browser = typeof BROWSERS[number]

export function parseArgs(): Args {
  return _parseArgs()
}

function _parseArgs() {
  const { positionals: argv } = util.parseArgs({ allowPositionals: true })

  process.env.NODE_ENV = process.env.NODE_ENV ?? 'production'

  if (argv.length !== 1)
    throw new Error('Must specify exactly one command')
  if (!COMMANDS.includes(argv[0] as Command))
    throw new Error(`Invalid command: ${argv[0]}`)

  if (!process.env.BROWSER)
    throw new Error('Must specify a browser')
  if (!BROWSERS.includes(process.env.BROWSER))
    throw new Error(`Invalid browser: ${process.env.BROWSER}`)

  return {
    command: argv[0] as Command,
    root: resolve('.'),
    src: resolve('src'),
    dist: join(resolve('dist'), process.env.BROWSER),
    manifest: resolve('src/manifest.ts'),
    verbose: Boolean(process.env.VERBOSE),
  }
}
