import type * as esbuild from 'esbuild'

import { AssetBase } from './AssetBase.ts'
import { createEsbuildContext } from './esbuild.ts'
import { colorizePath, logTime } from './utils.ts'

export class AssetMain extends AssetBase {
  protected esbuild!: esbuild.BuildContext

  constructor(inputPath: string, opts: AssetBase['opts'], type: AssetBase['type']) {
    super(inputPath, opts, type)
    this.reset()
  }

  override async init() {
    this.esbuild = await createEsbuildContext(this)
  }

  onEsbuildStart() {
    if (!this.isFirstBuild) {
      this.startTime = Date.now()
      console.log()
      logTime(`${colorizePath(this.opts.root, this.inputPath, this.opts.src)} (or child) changed...`)
    }
  }

  onEsbuildEnd() {
    if (!this.isFirstBuild)
      this.logDone()

    this.firstBuild.resolve()
  }

  override async innerBuild() {
    await this.esbuild.rebuild()
    await this.esbuild.dispose()
  }

  override async innerServe() {
    await this.esbuild.watch()
    await this.firstBuild
  }

  override async stop() {
    logTime(`${colorizePath(this.opts.root, this.inputPath, this.opts.src)} stopped...`)
    if (this.esbuild) {
      await this.esbuild.cancel()
      await this.esbuild.dispose()
    }

    await super.stop()

    this.reset()
    this.running = false
  }
}
