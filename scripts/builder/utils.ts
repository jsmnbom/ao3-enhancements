import path from 'node:path'

import chalk from 'chalk'
import * as esbuild from 'esbuild'
import type * as parse5 from 'parse5'
import type { EmptyObject } from 'type-fest'
import type { UnpluginInstance, UnpluginOptions } from 'unplugin'

import type { BaseAsset } from './Asset'
import { DIR, HTML_RE, SCRIPT_RE, SRC_DIR, STYLE_RE, isVerbose } from './constants.js'

export type File<HasContents extends boolean = true> = {
  fileName: string
  size: number
  map?: File
} & (HasContents extends true ? { contents: Uint8Array } : EmptyObject)

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
  constructor(private map: [RegExp, V][], private fallback?: F) {}

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

export function colorizePath(s: string, d: string, c: (s: string) => string = s => s) {
  return `${chalk.dim(path.relative(DIR, d))}/${c(path.relative(d, s))}`
}

const externalRE = /^(https?:)?\/\//
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

export function logBuild(asset: BaseAsset, files: File<false>[], metafile?: esbuild.Metafile) {
  console.log(colorizePath(asset.inputPath, SRC_DIR, chalk.bold))

  let pathPad = 0
  let biggestSize = 0
  let biggestMap = 0

  const entries = files.filter(f => !f.fileName.endsWith('.map')).sort((a, z) => a.size - z.size).map((entry) => {
    const logPath = colorizePath(entry.fileName, asset.config.dist_dir, FILENAME_COLORS.get(entry.fileName))

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
    let log = `  ${logPath.padEnd(pathPad)}`
    log += ` ${displaySize(entry.size).padStart(sizePad)}`
    if (entry.map)
      log += chalk.dim(` | map: ${displaySize(entry.map.size).padStart(mapPad)}`)
    console.log(log)
    if (isVerbose() && metafile) {
      const meta = metafile.outputs[path.relative(DIR, entry.fileName)]
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

export interface OnLoadArgs<T> extends Omit<esbuild.OnLoadArgs, 'pluginData'> {
  pluginData: T
}

export function wrapUnplugin<O>(plugin: UnpluginInstance<O, boolean>, options: O): UnpluginOptions | UnpluginOptions[] {
  return plugin.raw(options, { framework: 'esbuild' })
}
