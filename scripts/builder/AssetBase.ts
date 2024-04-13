import { Buffer } from 'node:buffer'
import path from 'node:path'

import { type ControlledPromise, createControlledPromise } from '@antfu/utils'
import { ref } from '@vue/reactivity'
import chalk from 'chalk'
import type { Promisable } from 'type-fest'

import type { Args } from './args.ts'
import { logBuild, logTime, writeFile } from './utils.ts'

export type AssetType = 'manifest' | 'script' | 'iife' | 'style' | 'page' | 'other'

export class AssetBase {
  protected onStopHandlers: (() => Promisable<void>)[] = []

  protected running = false
  public startTime = 0
  public isFirstBuild!: boolean
  public firstBuild!: ControlledPromise<void>

  public outputPath = ref<string | null>(null)

  protected contents?: () => string | Uint8Array

  constructor(
    public readonly inputPath: string,
    public args: Args,
    public type: AssetType,
  ) {
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
    if (p.startsWith(`${this.args.dist}/`))
      return p
    return path.join(this.args.dist, p)
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
      logBuild(this.args, this.inputPath, [file])
    }
  }
}
