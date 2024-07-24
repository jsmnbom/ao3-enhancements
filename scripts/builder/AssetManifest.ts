import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { effect, stop } from '@vue/reactivity'
import chokidar from 'chokidar'
import { getProperty as deepGet, deepKeys, setProperty as deepSet } from 'dot-prop'
import { parse } from 'semver'

import pJson from '../../package.json'

import { createAsset } from './Asset.ts'
import { AssetBase, type AssetType } from './AssetBase.ts'
import { CHOKIDAR_OPTIONS, DefaultMap, colorizePath, logTime } from './utils.ts'

const TARGET_VERSION_MANIFEST_KEYS: Record<Browser, string> = {
  chrome: 'minimum_chrome_version',
  firefox: 'browser_specific_settings.gecko.strict_min_version',
}

export class AssetParent extends AssetBase {
  static watcher: chokidar.FSWatcher | undefined
  get watcher() {
    return AssetParent.watcher ??= chokidar.watch([], { persistent: true, ignoreInitial: true, ...CHOKIDAR_OPTIONS })
  }

  protected oldSubAssets: Map<string, AssetBase> = new Map()
  protected subAssets: DefaultMap<string, AssetBase, [type?: AssetType | undefined]>

  constructor(inputPath: string, opts: AssetBase['opts'], type: AssetBase['type']) {
    super(inputPath, opts, type)

    this.subAssets = DefaultMap((key, type?: AssetType) => {
      return createAsset(key, this.opts, type)
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
          logTime(`${colorizePath(this.opts.root, this.inputPath, this.opts.src)} changed...`)
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
  constructor(inputPath: string, opts: AssetBase['opts']) {
    super(inputPath, opts, 'manifest')
    this.reset()
  }

  async init() {
    this.outputPath.value = path.join(this.opts.dist, 'manifest.json')

    const modulePath = `${fileURLToPath(new URL(this.inputPath, import.meta.url))}?t=${Date.now()}`
    const module = await import(modulePath) as { default: () => Record<string, unknown> }
    const manifest = module.default()

    this.parseSubAssets(manifest)
    this.parseTarget(manifest)

    this.parseVersion(manifest)

    this.contents = () => JSON.stringify(manifest, null, 2)
  }

  parseSubAssets(manifest: Record<string, unknown>) {
    for (const key of deepKeys(manifest)) {
      let value: string = deepGet(manifest, key)
      if (typeof value === 'string' && value.startsWith('./')) {
        value = path.join(this.opts.src, value)
        let type: AssetType | undefined
        if (key.startsWith('background.'))
          type = 'background'
        else if (/content_scripts.+\.js/.test(key))
          type = 'content_script'
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
  }

  parseTarget(manifest: Record<string, unknown>) {
    const key = TARGET_VERSION_MANIFEST_KEYS[process.env.BROWSER!]
    const version = deepGet(manifest, key)
    if (!version) {
      console.error(`Missing ${key} in manifest!`)
      process.exit(1)
    }

    this.opts.target = { [process.env.BROWSER!]: Number.parseInt(/(\d+)/.exec(version)![1]) }
  }

  parseVersion(manifest: Record<string, unknown>) {
    const parsed = parse(pJson.version)

    if (!parsed) {
      console.error(`Invalid version in package.json`)
      process.exit(1)
    }

    if (process.env.BROWSER === 'chrome') {
      manifest.version_name = pJson.version
    }
    else {
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1380219
      manifest.name = `${manifest.name} v${pJson.version}`
    }

    manifest.version = `${parsed.major}.${parsed.minor}.${parsed.patch}`
    if (parsed.prerelease.length > 0) {
      if (parsed.prerelease[0] === 'beta') {
        manifest.version += `.${parsed.prerelease[1]}`
      }
      else {
        console.error(`Invalid version in package.json`)
        process.exit(1)
      }
    }
  }
}
