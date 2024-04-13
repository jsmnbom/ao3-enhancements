import type * as esbuild from 'esbuild'

import type { Args } from './args.ts'
import { AssetBase, type AssetType } from './AssetBase.ts'
import { createEsbuildContext } from './esbuild.ts'
import { colorizePath, logTime } from './utils.ts'

export class AssetMain extends AssetBase {
  protected esbuild!: esbuild.BuildContext

  constructor(
    inputPath: string,
    args: Args,
    type: AssetType,
  ) {
    super(inputPath, args, type)
    this.reset()
  }

  async init() {
    this.esbuild = await createEsbuildContext(this)
  }

  onEsbuildStart() {
    if (!this.isFirstBuild) {
      this.startTime = Date.now()
      console.log()
      logTime(`${colorizePath(this.args.root, this.inputPath, this.args.src)} (or child) changed...`)
    }
  }

  onEsbuildEnd() {
    if (!this.isFirstBuild)
      this.logDone()

    this.firstBuild.resolve()
  }

  async innerBuild() {
    await this.esbuild.rebuild()
    await this.esbuild.dispose()
  }

  async innerServe() {
    await this.esbuild.watch()
    await this.firstBuild
  }

  async stop() {
    logTime(`${colorizePath(this.args.root, this.inputPath, this.args.src)} stopped...`)
    if (this.esbuild) {
      await this.esbuild.cancel()
      await this.esbuild.dispose()
    }

    await super.stop()

    this.reset()
    this.running = false
  }
}
