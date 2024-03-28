/* Build a node compatible build script (for use with --inspect profile which Bun does not support) */
import path from 'node:path'

import * as esbuild from 'esbuild'

const node_modules = path.resolve('node_modules')

const result = await esbuild.build({
  entryPoints: ['./scripts/builder/build.ts'],
  outfile: './build/build.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  sourcemap: true,
  external: [
    `${node_modules}/*`,
  ],
  metafile: true,
})

console.log(await esbuild.analyzeMetafile(result.metafile))
