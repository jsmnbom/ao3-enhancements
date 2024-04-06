import { join } from 'node:path'

import { parseArgs } from './args.js'

async function main() {
  const args = parseArgs()

  // Lazy load to make sure plugins and such know about the env
  const { createAsset } = await import('./Asset.js')

  const manifest = createAsset(join(args.src, 'manifest.ts'), args, 'manifest')

  if (args.command === 'build')
    await manifest.build().then(() => manifest.logDone())
  else if (args.command === 'serve')
    await manifest.serve().then(() => manifest.logDone())
}

await main()
