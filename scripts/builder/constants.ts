import path from 'node:path'

import type chokidar from 'chokidar'

export const DIR = path.resolve('.')
export const COMMANDS = ['build', 'watch'] as const
export const SRC_DIR = path.resolve('src')
export const BUILD_DIR = path.resolve('build')

export const CHOKIDAR_OPTIONS = {
  usePolling: true,
} satisfies chokidar.WatchOptions

export const SCRIPT_RE = /\.(?:m|c)?(?:j|t)sx?$/
export const STYLE_RE = /\.(?:c|le|sa|sc|pc)ss$/
export const HTML_RE = /\.html$/

const VERBOSITY = { verbose: false }
export const isVerbose = () => VERBOSITY.verbose
export const setVerbose = (v: boolean) => (VERBOSITY.verbose = v)
