import type { ChokidarOptions } from 'chokidar'
import type * as parse5 from 'parse5'
import type { EmptyObject } from 'type-fest'

import chalk from 'chalk'
import * as esbuild from 'esbuild'
import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import { dirname, relative } from 'node:path'

import type { AssetOpts } from './AssetBase.ts'

export const CHOKIDAR_OPTIONS = {
  usePolling: true,
} satisfies ChokidarOptions

export const SCRIPT_RE = /\.(?:m|c)?(?:j|t)sx?$/
export const STYLE_RE = /\.(?:c|le|sa|sc|pc)ss$/
export const HTML_RE = /\.html$/

export type File<HasContents extends boolean = true> = {
  fileName: string
  size: number
  map?: File
  flushed?: boolean
} & (HasContents extends true ? { contents: Uint8Array, hash?: string } : EmptyObject)

export function inlineMap(file: File, map: File) {
  let mapString = `# sourceMappingURL=data:application/json;base64,${Buffer.from(map.contents).toString('base64')}`
  if (file.fileName.endsWith('.css'))
    mapString = `/*${mapString}*/`
  else
    mapString = `//${mapString}`
  const mapBuffer = Buffer.from(`\n${mapString}`, 'utf8')
  const contents = new Uint8Array(file.contents.length + mapBuffer.length)
  contents.set(file.contents)
  contents.set(mapBuffer, file.contents.length)
  return contents
}

export type DefaultMap<K, V, GetArgs extends [...any] = []> = Omit<Map<K, V>, 'get'> & { get: (key: K, ...args: GetArgs) => V }
// eslint-disable-next-line ts/no-redeclare
export function DefaultMap<K, V, GetArgs extends [...any] = []>(defaultValue: (key: K, ...args: GetArgs) => V) {
  const map = new Map<K, V>()
  const _get = map.get.bind(map)
  return Object.defineProperty(map, 'get', {
    value(this: Map<K, V>, key: K, ...args: GetArgs) {
      if (!this.has(key))
        this.set(key, defaultValue(key, ...args))
      return _get(key)!
    },
  }) as DefaultMap<K, V>
}

export class RegexMap<const V, const F = undefined> {
  private map: [RegExp, V][];
  private fallback?: F;

  constructor(map: [RegExp, V][], fallback?: F) {
    this.map = map;
    this.fallback = fallback;
  }

  get(key: string): V | F
  get<FF>(key: string, fallback: FF): V | FF | undefined
  get<FF>(key: string, fallback?: V): V | F | FF | undefined {
    for (const [re, value] of this.map) {
      if (re.test(key))
        return value
    }
    return fallback ?? this.fallback ?? undefined
  }
}

export const FILENAME_COLORS = new RegexMap([
  [SCRIPT_RE, chalk.cyan],
  [STYLE_RE, chalk.magenta],
  [HTML_RE, chalk.yellow],
], chalk.green)

export function colorizePath(root: string, path: string, dir: string, color: (s: string) => string = s => s) {
  return `${chalk.dim(relative(root, dir))}/${color(relative(dir, path))}`
}

const externalRE = /^(?:https?:)?\/\//
export const isExternalUrl = (url: string): boolean => externalRE.test(url)

const numberFormatter = new Intl.NumberFormat('en', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})
const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
})

function displaySize(bytes: number) {
  return `${numberFormatter.format(bytes / 1000)} kB`
}

export function logBuild(opts: AssetOpts, inputPath: string, files: File<false>[], metafile?: esbuild.Metafile) {
  const { root, src, dist } = opts

  console.log(colorizePath(root, inputPath, src, chalk.bold))

  let pathPad = 0
  let biggestSize = 0
  let biggestMap = 0

  const entries = files.filter(f => !f.fileName.endsWith('.map')).sort((a, z) => a.size - z.size).map((entry) => {
    const logPath = colorizePath(root, entry.fileName, dist, FILENAME_COLORS.get(entry.fileName))

    if (logPath.length > pathPad)
      pathPad = logPath.length
    if (entry.size > biggestSize)
      biggestSize = entry.size
    if (entry.map && entry.map.size > biggestMap)
      biggestMap = entry.map.size

    return { logPath, entry }
  })

  const sizePad = displaySize(biggestSize).length
  const mapPad = displaySize(biggestMap).length

  for (const { logPath, entry } of entries) {
    let log = `  ${chalk.dim(entry.flushed ? '+' : ' ')}${logPath.padEnd(pathPad)}`
    log += ` ${displaySize(entry.size).padStart(sizePad)}`
    if (entry.map)
      log += chalk.dim(` | map: ${displaySize(entry.map.size).padStart(mapPad)}`)
    console.log(log)
    if (opts.verbose && metafile) {
      const meta = metafile.outputs[relative(root, entry.fileName)]
      if (meta) {
        const analysed = (esbuild.analyzeMetafileSync({ inputs: {}, outputs: { [entry.fileName]: meta } })).split('\n').slice(2, -1).join('\n')
        console.log(chalk.dim(analysed))
      }
    }
  }
}

export async function traverseElements(
  root: parse5.DefaultTreeAdapterMap['document'],
  visitor: (el: parse5.DefaultTreeAdapterMap['element']) => Promise<void> | void,
) {
  await inner(root)
  async function inner(node: parse5.DefaultTreeAdapterMap['node']) {
    if (node.nodeName[0] !== '#')
      await visitor(node as parse5.DefaultTreeAdapterMap['element'])
    for (const child of 'childNodes' in node ? node.childNodes : [])
      await inner(child)
  }
}

export function logTime(...args: unknown[]) {
  console.log(chalk.dim(`[${timeFormatter.format(Date.now())}]`), ...args)
}

const fileCache = new Map<string, string>()

export async function writeFile(file: File, skipCache = false) {
  const hash = file.hash ?? makeHash(file.contents)

  if (skipCache || fileCache.get(file.fileName) !== hash) {
    await fs.mkdir(dirname(file.fileName), { recursive: true })
    await fs.writeFile(file.fileName, file.contents)
    file.flushed = true
    fileCache.set(file.fileName, hash)
  }
  if (file.map)
    await writeFile(file.map)
}

export function makeHash(contents: Uint8Array) {
  return crypto.createHash('sha1').update(contents).digest('hex')
}
