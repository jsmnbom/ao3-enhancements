import { join } from 'node:path'

import { parseArgs } from './args.ts'

async function main() {
  const args = parseArgs()

  // Lazy load to make sure plugins and such know about the env
  const { createAsset } = await import('./Asset.ts')

  const manifest = createAsset(join(args.src, 'manifest.ts'), args, 'manifest')

  if (args.command === 'build')
    await manifest.build().then(() => manifest.logDone())
  else if (args.command === 'serve')
    await manifest.serve().then(() => manifest.logDone())
}

await main()
