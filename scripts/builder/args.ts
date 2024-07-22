import * as util from 'node:util'

import { BROWSERS } from './build.ts'

export type Args = ReturnType<typeof parseArgs>

export const COMMANDS = ['build', 'serve'] as const
export type Command = typeof COMMANDS[number]

export function parseArgs() {
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
    verbose: Boolean(process.env.VERBOSE),
  }
}
