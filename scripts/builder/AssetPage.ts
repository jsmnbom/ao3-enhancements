import type * as parse5 from 'parse5'

import { ref } from '@vue/reactivity'
import fs from 'node:fs/promises'
import path, { dirname, join, relative } from 'node:path'
import { parse, serialize } from 'parse5'
import * as vite from 'vite'

import type { AssetBase } from './AssetBase.ts'

import { AssetParent } from './AssetManifest.ts'
import { colorizePath, isExternalUrl, logTime, SCRIPT_RE, traverseElements } from './utils.ts'
import { createViteConfig } from './vite.ts'

export class ViteInput {
  public attrs: parse5.Token.Attribute[] = []
  public cssBundlePaths?: string[]

  public inputPath: string
  public asset: AssetPage

  constructor(inputPath: string, asset: AssetPage) {
    this.inputPath = inputPath
    this.asset = asset
  }

  setAttrs(value: string, relative = false) {
    for (const attr of this.attrs)
      attr.value = relative ? this.asset.formatRelativePath(value) : value
  }
}

export class AssetPage extends AssetParent {
  static server?: vite.ViteDevServer
  static inputs = new Map<string, ViteInput>()

  config!: vite.InlineConfig
  inputs: ViteInput[] = []

  constructor(inputPath: string, opts: AssetBase['opts']) {
    super(inputPath, opts, 'page')
    this.reset()
  }

  getInput(inputPath: string) {
    if (AssetPage.inputs.has(inputPath))
      return AssetPage.inputs.get(inputPath)!

    const input = new ViteInput(inputPath, this)
    AssetPage.inputs.set(inputPath, input)
    return input
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

  override async init() {
    const data = await fs.readFile(this.inputPath, 'utf-8')
    this.outputPath.value = path.join(this.opts.dist, path.relative(this.opts.src, this.inputPath))

    const ast = parse(data)
    await traverseElements(ast, async (el) => {
      for (const attrConfig of Object.entries(AssetPage.AttrsConfig)) {
        if (el.nodeName === attrConfig[0]) {
          for (const attr of el.attrs) {
            if (attrConfig[1].includes(attr.name)) {
              const value = attr.value
              if (value) {
                if (!isExternalUrl(value)) {
                  const inputPath = join(dirname(this.inputPath), value)

                  if (SCRIPT_RE.test(value)) {
                    const input = this.getInput(inputPath)
                    this.inputs.push(input)
                    input.attrs.push(attr)
                  }
                }
              }
            }
          }
        }
      }
    })

    this.contents = () => {
      let html = serialize(ast)
      if (AssetPage.server)
        html = html.replace(/<\/head>/i, match => `<script type="module" src="${AssetPage.server!.resolvedUrls!.local[0]}@vite/client"></script>\n${match}`)
      for (const asset of this.inputs.values()) {
        if (asset.cssBundlePaths) {
          for (const cssBundlePath of asset.cssBundlePaths)
            html = html.replace(/<\/head>/i, match => `<link rel="stylesheet" href="${this.formatRelativePath(cssBundlePath)}">\n${match}`)
        }
      }
      return html
    }
  }

  override async innerBuild() {
    const config = await createViteConfig(this, this.inputs)
    await vite.build(config)
    await this.write()
  }

  override async innerServe() {
    this.firstBuild.resolve()
    await this.ensureServerStarted()
    await this.write()
  }

  override async stop() {
    logTime(`${colorizePath(this.opts.root, this.inputPath, this.opts.src)} stopped...`)

    await super.stop()

    this.reset()
    this.running = false
  }

  async ensureServerStarted() {
    if (!AssetPage.server) {
      const origin = ref<string | null>(null)
      const config = await createViteConfig(this, [...AssetPage.inputs.values()], origin)
      AssetPage.server = await vite.createServer(config)
      await AssetPage.server.listen()
      origin.value = AssetPage.server.resolvedUrls!.local[0]!.replace(/\/$/, '')
    }
    for (const input of this.inputs)
      input.setAttrs(`${AssetPage.server.resolvedUrls!.local[0]}${relative(this.opts.root, input.inputPath)}`)
  }
}
