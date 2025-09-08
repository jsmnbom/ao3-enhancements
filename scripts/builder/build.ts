import { join, resolve } from 'node:path'

import type { AssetOpts } from './AssetBase.ts'

import { parseArgs } from './args.ts'
import { createAsset } from './Asset.ts'

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
