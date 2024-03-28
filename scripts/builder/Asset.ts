import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { type ControlledPromise, createControlledPromise } from '@antfu/utils'
import chalk from 'chalk'
import chokidar from 'chokidar'
import { getProperty as deepGet, deepKeys, setProperty as deepSet } from 'dot-prop'
import type * as esbuild from 'esbuild'
import { parse, serialize } from 'parse5'
import type { Promisable } from 'type-fest'

import type { Browser } from '../../src/manifest.js'

import { CHOKIDAR_OPTIONS, HTML_RE, SCRIPT_RE, SRC_DIR, STYLE_RE } from './constants.js'
import { createEsbuildContext } from './esbuild.js'
import { DefaultMap, RegexMap, colorizePath, isExternalUrl, logBuild, logTime, traverseElements } from './utils.js'

export type AssetType = 'manifest' | 'script' | 'iife' | 'style' | 'page' | 'other'

export interface AssetData {
  outputPath?: string
  cssBundlePath?: string
}

export interface AssetConfig {
  browser: Browser
  dist_dir: string
}

export interface AssetParams {
  type: AssetType
  outputPath?: string
}

const ASSET_CACHE = DefaultMap<AssetConfig, Map<string, BaseAsset>>(() => new Map())

const ASSET_TYPE_MAP = new RegexMap([
  [SCRIPT_RE, 'script'],
  [STYLE_RE, 'style'],
  [HTML_RE, 'page'],
], 'other')

export function createAsset(inputPath: string, config: AssetConfig, params: Partial<AssetParams>) {
  const cache = ASSET_CACHE.get(config)
  if (cache.has(inputPath))
    return cache.get(inputPath)!

  const type = params.type ?? ASSET_TYPE_MAP.get(inputPath)

  let asset: BaseAsset
  if (type === 'manifest')
    asset = new ManifestAsset(inputPath, config, { ...params, type })
  else if (type === 'page')
    asset = new PageAsset(inputPath, config, { ...params, type })
  else
    asset = new Asset(inputPath, config, { ...params, type })

  cache.set(inputPath, asset)
  return asset
}

export class BaseAsset {
  static watcher: chokidar.FSWatcher | undefined
  get watcher() {
    return BaseAsset.watcher ??= chokidar.watch([], { persistent: true, ignoreInitial: true, ...CHOKIDAR_OPTIONS })
  }

  public type: AssetType

  protected onUpdateHandlers: (() => Promisable<void>)[] = []
  protected onStopHandlers: (() => Promisable<void>)[] = []

  protected running = false
  public startTime = 0
  public isFirstBuild!: boolean
  public firstBuild!: ControlledPromise<void>

  public data!: AssetData

  protected resetData: () => void

  constructor(
    public readonly inputPath: string,
    public config: { browser: Browser, dist_dir: string },
    params: AssetParams,
  ) {
    this.type = params.type

    this.resetData = () => {
      this.data = {
        outputPath: params.outputPath,
      }
    }
  }

  reset() {
    this.onUpdateHandlers = []
    this.onStopHandlers = []

    this.isFirstBuild = true
    this.firstBuild = createControlledPromise<void>()
    void this.firstBuild.then(() => {
      this.isFirstBuild = false
    })

    this.resetData()
  }

  get outputPath() {
    if (!this.data.outputPath)
      throw new Error(`Output path not set for ${this.inputPath}`)

    return this.data.outputPath
  }

  formatPath(p: string, resolveDir: string) {
    if (p.startsWith('.'))
      return path.resolve(resolveDir, p)
    if (p.startsWith(`${this.config.dist_dir}/`))
      return p
    return path.join(this.config.dist_dir, p)
  }

  formatRelativePath(p: string) {
    return `./${path.relative(path.dirname(this.outputPath), p)}`
  }

  onUpdate(fn: BaseAsset['onUpdateHandlers'][0]) {
    this.onUpdateHandlers.push(fn)
  }

  onStop(fn: BaseAsset['onStopHandlers'][0]) {
    this.onStopHandlers.push(fn)
  }

  async update(data: AssetData = {}) {
    this.data = { ...this.data, ...data }
    for (const handler of this.onUpdateHandlers)
      await handler()
  }

  async init() {}

  async build() {
    if (this.running)
      return
    this.running = true
    this.startTime = Date.now()
    await this.init()
    await this.innerBuild()
    this.running = false
  }

  async innerBuild() {}

  async watch() {
    if (this.running)
      return
    this.running = true
    this.startTime = Date.now()
    await this.init()
    await this.innerWatch()
  }

  async innerWatch() {}

  logDone() {
    logTime(chalk.green(`Built in ${((Date.now() - this.startTime))}ms`))
  }

  async stop() {
    for (const handler of this.onStopHandlers)
      await handler()
  }
}

export class Asset extends BaseAsset {
  protected esbuild!: esbuild.BuildContext

  constructor(
    inputPath: string,
    config: AssetConfig,
    params: AssetParams,
  ) {
    super(inputPath, config, params)
    this.reset()
  }

  async init() {
    this.esbuild = await createEsbuildContext({
      asset: this,
      onStart: () => {
        if (!this.isFirstBuild) {
          this.startTime = Date.now()
          console.log()
          logTime(`${colorizePath(this.inputPath, SRC_DIR)} (or child) changed...`)
        }
      },
      onEnd: async () => {
        if (!this.isFirstBuild)
          this.logDone()

        this.firstBuild.resolve()
      },
    })
  }

  async innerBuild() {
    await this.esbuild.rebuild()
    await this.esbuild.dispose()
  }

  async innerWatch() {
    await this.esbuild.watch()
    await this.firstBuild
  }

  async stop() {
    logTime(`${colorizePath(this.inputPath, SRC_DIR)} stopped...`)
    if (this.esbuild) {
      await this.esbuild.cancel()
      await this.esbuild.dispose()
    }

    await super.stop()

    this.reset()
    this.running = false
  }
}

export class ParentAsset extends BaseAsset {
  protected contents?: () => string | Uint8Array

  protected oldSubAssets: Map<string, BaseAsset> = new Map()
  protected subAssets: DefaultMap<string, BaseAsset, [type?: AssetType | undefined]>

  constructor(
    inputPath: string,
    config: AssetConfig,
    params: AssetParams,
  ) {
    super(inputPath, config, params)

    this.subAssets = DefaultMap((key, type?: AssetType) => {
      return createAsset(key, this.config, { type })
    })

    this.reset()
  }

  reset() {
    super.reset()
    this.oldSubAssets.clear()
    for (const [inputPath, asset] of this.subAssets.entries())
      this.oldSubAssets.set(inputPath, asset)
    this.subAssets.clear()
  }

  async innerBuild() {
    if (this.subAssets.size > 0) {
      await Promise.all([...this.subAssets.values()].map(asset => asset.build()))

      await this.write()
    }
  }

  async innerWatch() {
    if (this.subAssets.size > 0) {
      await Promise.all([...this.subAssets.values()].map(asset => asset.watch()))

      for (const asset of this.oldSubAssets.values())
        await asset.update()

      for (const inputPath of this.subAssets.keys())
        this.oldSubAssets.delete(inputPath)

      for (const asset of this.oldSubAssets.values())
        await asset.stop()

      await this.write()

      this.watcher.add(this.inputPath)

      const listener = (fileName: string) => {
        if (fileName !== this.inputPath)
          return
        this.watcher.off('change', listener)
        void (async () => {
          console.log()
          logTime(`${colorizePath(this.inputPath, SRC_DIR)} changed...`)
          await this.stop()
          this.reset()
          this.running = false
          void this.watch().then(() => {
            this.logDone()
          })
        })()
      }

      this.watcher.on('change', listener)
      this.onStop(() => {
        this.watcher.off('change', listener)
      })
    }
  }

  async write() {
    if (this.contents) {
      await fs.mkdir(path.dirname(this.outputPath), { recursive: true })
      await fs.writeFile(this.outputPath, this.contents())
      logBuild(this, [{ fileName: this.outputPath, size: (await fs.stat(this.outputPath)).size }])
    }
  }
}

export class ManifestAsset extends ParentAsset {
  constructor(
    inputPath: string,
    config: AssetConfig,
    params: AssetParams,
  ) {
    super(inputPath, config, params)
    this.reset()
  }

  get outputPath() {
    return this.data.outputPath ?? path.join(this.config.dist_dir, 'manifest.json')
  }

  async init() {
    let manifest: Record<string, unknown>
    if (process.isBun) {
      const modulePath = `${fileURLToPath(new URL(this.inputPath, import.meta.url))}?t=${Date.now()}`
      const module = await import(modulePath) as { default: (browser: Browser) => Record<string, unknown> }
      manifest = module.default(this.config.browser)
    }
    else {
      console.log('USING JITI')
      const Jiti = (await import('jiti')).default
      const jiti = Jiti(fileURLToPath(import.meta.url))
      const modulePath = `${this.inputPath}`
      const module = await jiti.import(modulePath, {}) as { default: (browser: Browser) => Record<string, unknown> }
      manifest = module.default(this.config.browser)
    }

    for (const key of deepKeys(manifest)) {
      let value: string = deepGet(manifest, key)
      if (typeof value === 'string' && value.startsWith('./')) {
        value = path.join(SRC_DIR, value)
        let type: AssetType | undefined
        if (key.startsWith('background.'))
          type = 'script'
        else if (/content_scripts.+\.js/.test(key))
          type = 'iife'
        const asset = this.subAssets.get(value, type)
        asset.onUpdate(() => {
          deepSet(manifest, key, this.formatRelativePath(asset.outputPath))
        })
      }
    }

    this.contents = () => JSON.stringify(manifest, null, 2)
  }
}

export class PageAsset extends ParentAsset {
  constructor(
    inputPath: string,
    config: AssetConfig,
    params: AssetParams,
  ) {
    super(inputPath, config, params)
    this.reset()
  }

  static AttrsConfig: Record<string, string[]> = {
    script: ['src'],
    style: ['href'],
    link: ['href'],
    video: ['src', 'poster'],
    source: ['src', 'srcset'],
    img: ['src', 'srcset'],
    image: ['xlink:href', 'href'],
    use: ['xlink:href', 'href'],
  }

  get outputPath() {
    return this.data.outputPath ?? path.join(this.config.dist_dir, path.relative(SRC_DIR, this.inputPath))
  }

  async init() {
    const data = await fs.readFile(this.inputPath, 'utf-8')

    const ast = parse(data)
    await traverseElements(ast, async (el) => {
      for (const attrConfig of Object.entries(PageAsset.AttrsConfig)) {
        if (el.nodeName === attrConfig[0]) {
          for (const attr of el.attrs) {
            if (attrConfig[1].includes(attr.name)) {
              let value = attr.value
              if (value) {
                if (!isExternalUrl(value)) {
                  value = this.formatPath(value, path.dirname(this.inputPath))
                  const asset = this.subAssets.get(value)
                  asset.onUpdate(() => {
                    attr.value = this.formatRelativePath(asset.outputPath)
                  })
                }
              }
            }
          }
        }
      }
    })

    this.contents = () => {
      let html = serialize(ast)
      for (const asset of this.subAssets.values()) {
        if (asset.data.cssBundlePath)
          html = html.replace(/<\/head>/i, match => `<link rel="stylesheet" href="${this.formatRelativePath(asset.data.cssBundlePath!)}">\n${match}`)
      }
      return html
    }
  }
}
