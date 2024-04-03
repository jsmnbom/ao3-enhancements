import fs from 'node:fs/promises'
import { resolve } from 'node:path'

import type * as esbuild from 'esbuild'
import * as svgo from 'svgo'

import type { OnLoadArgs } from '../utils.js'

export function SvgPlugin({ svgoConfig }: { svgoConfig: svgo.Config }) {
  return {
    name: 'svg',
    setup(build) {
      build.onResolve({ filter: /\.svg$/ }, ({ path, resolveDir }) => ({ path: resolve(resolveDir, path), pluginData: { resolveDir } }))
      build.onLoad({ filter: /\.svg$/ }, async (args) => {
        const { path, pluginData: { resolveDir } } = args as OnLoadArgs<{ resolveDir: string }>
        const svg = await fs.readFile(path, 'utf-8')
        const optimized = svgo.optimize(svg, svgoConfig).data
        return { contents: optimized, loader: 'file' as const, resolveDir }
      })
    },
  } as esbuild.Plugin
}
