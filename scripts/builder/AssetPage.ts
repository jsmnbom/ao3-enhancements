import fs from 'node:fs/promises'
import path, { dirname, join, relative } from 'node:path'

import { ref } from '@vue/reactivity'
import { parse, serialize } from 'parse5'
import type * as parse5 from 'parse5'
import * as vite from 'vite'

import type { Args } from './args.js'
import type { AssetType } from './AssetBase.js'
import { AssetParent } from './AssetManifest.js'
import { SCRIPT_RE, colorizePath, isExternalUrl, logTime, traverseElements } from './utils.js'
import { createViteConfig } from './vite.js'

export class ViteInput {
  public attrs: parse5.Token.Attribute[] = []
  public cssBundlePaths?: string[]

  constructor(public inputPath: string, public asset: AssetPage) {

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

  constructor(
    inputPath: string,
    args: Args,
    type: AssetType,
  ) {
    super(inputPath, args, type)
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

  async init() {
    const data = await fs.readFile(this.inputPath, 'utf-8')
    this.outputPath.value = path.join(this.args.dist, path.relative(this.args.src, this.inputPath))

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

  async innerBuild() {
    const config = await createViteConfig(this, this.inputs)
    await vite.build(config)
    await this.write()
  }

  async innerServe() {
    this.firstBuild.resolve()
    await this.ensureServerStarted()
    await this.write()
  }

  async stop() {
    logTime(`${colorizePath(this.args.root, this.inputPath, this.args.src)} stopped...`)

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
      origin.value = AssetPage.server.resolvedUrls!.local[0]

      for (const input of this.inputs)
        input.setAttrs(`${AssetPage.server.resolvedUrls!.local[0]}${relative(this.args.root, input.inputPath)}`)
    }
  }
}
