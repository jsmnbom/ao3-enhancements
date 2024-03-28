import path from 'node:path'
import process from 'node:process'

import * as esbuild from 'esbuild'
import RadixVueResolver from 'radix-vue/resolver'
import * as svgo from 'svgo'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import IconResolver from 'unplugin-icons/resolver'
import type { ComponentResolver } from 'unplugin-vue-components'

import unoConfig from '../../uno.config.js'

import { SRC_DIR } from './constants.js'
import type { Options } from './plugins/asset.js'
import { AssetPlugin } from './plugins/asset.js'
import { IconsPlugin } from './plugins/icons.js'
import { SvgPlugin } from './plugins/svg.js'
import { UnocssPlugin } from './plugins/unocss.js'
import { VuePlugin } from './plugins/vue.js'

export const svgoConfig = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
        },
      },
    },
  ],
} satisfies svgo.Config

export async function createEsbuildContext(options: Options) {
  const { asset } = options
  const context = {
    entryPoints: [asset.inputPath],
    bundle: true,
    entryNames: '[dir]/[name]',
    assetNames: '[dir]/[name]',
    chunkNames: '[dir]/[name]',
    outbase: SRC_DIR,
    outdir: asset.config.dist_dir,
    format: asset.type === 'iife' ? 'iife' : 'esm',
    target: ['chrome120', 'firefox117'],
    write: false,

    sourcemap: process.env.NODE_ENV === 'development' ? 'external' : false,
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    minifySyntax: process.env.NODE_ENV === 'production',

    loader: {
      '.ico': 'file',
      '.png': 'file',
    },

    plugins: [
      UnocssPlugin(unoConfig),
      SvgPlugin({ svgoConfig }),
      IconsPlugin({
        jsxImport: `import * as React from '#dom';`,
        customCollections: {
          ao3e: FileSystemIconLoader(path.join(SRC_DIR, 'icons')),
        },
        transform: svg => svgo.optimize(svg, svgoConfig).data,
      }),
      VuePlugin({
        components: {
          dirs: [],
          dts: 'src/components.d.ts',
          resolvers: [
            (RadixVueResolver as () => ComponentResolver)(),
            IconResolver({
              prefix: 'icon',
              customCollections: [
                'aoe3',
              ],
              extension: '.vue',
            }),
          ],

        },
      }),
      AssetPlugin(options),
    ],
  } as esbuild.BuildOptions

  return await esbuild.context(context)
}
