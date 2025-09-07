import type { ControlledPromise } from '@antfu/utils'
import type { Promisable } from 'type-fest'

import { createControlledPromise } from '@antfu/utils'
import { ref } from '@vue/reactivity'
import chalk from 'chalk'
import { Buffer } from 'node:buffer'
import path from 'node:path'

import type { Args } from './args.ts'

import { logBuild, logTime, writeFile } from './utils.ts'

export type AssetType = 'manifest' | 'background' | 'content_script' | 'module' | 'style' | 'page' | 'other'

export interface AssetOpts extends Args {
  root: string
  src: string
  dist: string
  manifest: string
  target: Record<string, number>
}

export class AssetBase {
  protected onStopHandlers: (() => Promisable<void>)[] = []

  protected running = false
  public startTime = 0
  public isFirstBuild!: boolean
  public firstBuild!: ControlledPromise<void>

  public outputPath = ref<string | null>(null)

  protected contents?: () => string | Uint8Array

  public readonly inputPath: string
  public opts: AssetOpts
  public type: AssetType

  constructor(
    inputPath: string,
    opts: AssetOpts,
    type: AssetType,
  ) {
    this.inputPath = inputPath
    this.opts = opts
    this.type = type
  }

  reset() {
    this.onStopHandlers = []

    this.isFirstBuild = true
    this.firstBuild = createControlledPromise<void>()
    void this.firstBuild.then(() => {
      this.isFirstBuild = false
    })
  }

  formatPath(p: string, resolveDir: string) {
    if (p.startsWith('.'))
      return path.resolve(resolveDir, p)
    if (p.startsWith(`${this.opts.dist}/`))
      return p
    return path.join(this.opts.dist, p)
  }

  formatRelativePath(p: string) {
    return `./${path.relative(path.dirname(this.outputPath.value || ''), p)}`
  }

  onStop(fn: AssetBase['onStopHandlers'][0]) {
    this.onStopHandlers.push(fn)
  }

  async init() { }

  async build() {
    if (this.running)
      return
    this.running = true
    this.startTime = Date.now()
    await this.init()
    await this.innerBuild()
    this.running = false
  }

  async innerBuild() { }

  async serve() {
    if (this.running)
      return
    this.running = true
    this.startTime = Date.now()
    await this.init()
    await this.innerServe()
  }

  async innerServe() { }

  logDone() {
    logTime(chalk.green(`Built in ${((Date.now() - this.startTime))}ms`))
  }

  async stop() {
    for (const handler of this.onStopHandlers)
      await handler()
  }

  async write() {
    if (this.contents) {
      const raw = this.contents()
      const contents = raw instanceof Uint8Array ? raw : Buffer.from(raw)
      const file = {
        fileName: this.outputPath.value!,
        contents,
        size: contents.byteLength,
      }
      await writeFile(file)
      logBuild(this.opts, this.inputPath, [file])
    }
  }
}
