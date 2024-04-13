import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { effect, stop } from '@vue/reactivity'
import chokidar from 'chokidar'
import { getProperty as deepGet, deepKeys, setProperty as deepSet } from 'dot-prop'

import type { Args, Browser } from './args.ts'
import { createAsset } from './Asset.ts'
import { AssetBase, type AssetType } from './AssetBase.ts'
import { CHOKIDAR_OPTIONS, DefaultMap, colorizePath, logTime } from './utils.ts'

export class AssetParent extends AssetBase {
  static watcher: chokidar.FSWatcher | undefined
  get watcher() {
    return AssetParent.watcher ??= chokidar.watch([], { persistent: true, ignoreInitial: true, ...CHOKIDAR_OPTIONS })
  }

  protected oldSubAssets: Map<string, AssetBase> = new Map()
  protected subAssets: DefaultMap<string, AssetBase, [type?: AssetType | undefined]>

  constructor(
    inputPath: string,
    args: Args,
    type: AssetType,
  ) {
    super(inputPath, args, type)

    this.subAssets = DefaultMap((key, type?: AssetType) => {
      return createAsset(key, this.args, type)
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

  async innerServe() {
    if (this.subAssets.size > 0) {
      await Promise.all([...this.subAssets.values()].map(asset => asset.serve()))

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
          logTime(`${colorizePath(this.args.root, this.inputPath, this.args.src)} changed...`)
          await this.stop()
          this.reset()
          this.running = false
          void this.serve().then(() => {
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
}

export class AssetManifest extends AssetParent {
  constructor(
    inputPath: string,
    args: Args,
    type: AssetType,
  ) {
    super(inputPath, args, type)
    this.reset()
  }

  async init() {
    this.outputPath.value = path.join(this.args.dist, 'manifest.json')

    const modulePath = `${fileURLToPath(new URL(this.inputPath, import.meta.url))}?t=${Date.now()}`
    const module = await import(modulePath) as { default: (browser: Browser) => Record<string, unknown> }
    const manifest = module.default(this.args.browser)

    for (const key of deepKeys(manifest)) {
      let value: string = deepGet(manifest, key)
      if (typeof value === 'string' && value.startsWith('./')) {
        value = path.join(this.args.src, value)
        let type: AssetType | undefined
        if (key.startsWith('background.'))
          type = 'script'
        else if (/content_scripts.+\.js/.test(key))
          type = 'iife'
        const asset = this.subAssets.get(value, type)

        const runner = effect(() => asset.outputPath.value, {
          scheduler: () => {
            if (asset.outputPath.value)
              deepSet(manifest, key, this.formatRelativePath(asset.outputPath.value))
          },
        })
        this.onStopHandlers.push(() => stop(runner))
      }
    }
    this.contents = () => JSON.stringify(manifest, null, 2)
  }
}
