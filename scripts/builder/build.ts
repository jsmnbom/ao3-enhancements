import { join, resolve } from 'node:path'

import { parseArgs } from './args.ts'
import { createAsset } from './Asset.ts'
import type { AssetOpts, AssetType } from './AssetBase.ts'

export const BROWSERS = ['chrome', 'firefox'] as const

async function main() {
  const args = parseArgs()

  const opts: AssetOpts = {
    ...args,
    root: resolve('.'),
    src: resolve('src'),
    dist: join(resolve('dist'), process.env.BROWSER!),
    manifest: resolve('src/manifest.ts'),
    target: {},
  }

  const manifest = createAsset(opts.manifest, opts, 'manifest')

  if (args.command === 'build')
    await manifest.build().then(() => manifest.logDone()).then(() => process.exit(0))
  else if (args.command === 'serve')
    await manifest.serve().then(() => manifest.logDone())
}

await main()

declare global {
  type Browser = typeof BROWSERS[number]

  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      BROWSER?: Browser
      CONTEXT?: AssetType
    }
  }
}
