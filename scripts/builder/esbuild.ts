import path from 'node:path'
import process from 'node:process'

import * as esbuild from 'esbuild'
import RadixVueResolver from 'radix-vue/resolver'
import * as svgo from 'svgo'
import AutoImport from 'unplugin-auto-import'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import IconResolver from 'unplugin-icons/resolver'
import type { ComponentResolver } from 'unplugin-vue-components'
import unpluginVueComponents from 'unplugin-vue-components'

import unoConfig from '../../uno.config.js'

import { SRC_DIR } from './constants.js'
import { AssetPlugin, type Options } from './plugins/asset.js'
import { IconsPlugin } from './plugins/icons.js'
import { JsPlugin } from './plugins/js.js'
import { SvgPlugin } from './plugins/svg.js'
import { UnocssPlugin } from './plugins/unocss.js'
import { VuePlugin } from './plugins/vue.js'
import { wrapUnplugin } from './utils.js'

const SVGO_CONFIG = {
  plugins: [{
    name: 'preset-default',
    params: {
      overrides: {
        removeViewBox: false,
        minifyStyles: false,
      },
    },
  },
  ],
} satisfies svgo.Config

const DEFAULT_PLUGINS = [
  SvgPlugin({ svgoConfig: SVGO_CONFIG }),
]

const AUTO_IMPORT_PLUGIN = wrapUnplugin(AutoImport, {
  imports: [
    'vue',
    '@vueuse/core',
    { from: 'radix-vue', imports: ['useEmitAsProps', 'useForwardProps', 'useForwardPropsEmits', 'useForwardExpose'] },
    { from: 'vue-sonner', imports: ['toast'] },
  ],
  ignore: ['h'],
  dirs: [
    path.join(SRC_DIR, 'options_ui/composables'),
    path.join(SRC_DIR, 'options_ui/directives'),
  ],
  dts: path.join(SRC_DIR, 'auto-imports.d.ts'),
})

const CUSTOM_ICON_COLLECTIONS = {
  ao3e: FileSystemIconLoader(path.join(SRC_DIR, 'icons')),
} as const

const SCRIPT_PLUGINS = [
  UnocssPlugin({
    ...unoConfig,
    configFile: false,
    content: {
      pipeline: {
        include: [path.join(SRC_DIR, 'options_ui/**/*.vue')],
      },
    },
  }),
  IconsPlugin({
    jsxImport: `import * as React from '#dom';`,
    customCollections: CUSTOM_ICON_COLLECTIONS,
    transform: svg => svgo.optimize(svg, SVGO_CONFIG).data,
  }),
  VuePlugin({
    plugins: [
      wrapUnplugin(unpluginVueComponents, {
        dirs: [
          path.join(SRC_DIR, 'options_ui/components'),
        ],
        dts: path.join(SRC_DIR, 'components.d.ts'),
        resolvers: [
          (RadixVueResolver as (options: { prefix?: string }) => ComponentResolver)({ prefix: 'Radix' }),
          IconResolver({
            prefix: 'icon',
            customCollections: Object.keys(CUSTOM_ICON_COLLECTIONS),
            extension: '.vue',
          }),
        ],
      }),
      AUTO_IMPORT_PLUGIN,
    ],
  }),
  JsPlugin({
    plugins: [AUTO_IMPORT_PLUGIN],
  }),
]

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

    sourcemap: 'external',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    treeShaking: true,
    minifySyntax: true,
    minifyWhitespace: process.env.NODE_ENV === 'production',
    minifyIdentifiers: process.env.NODE_ENV === 'production',

    loader: {
      '.ico': 'file',
      '.png': 'file',
    },

    plugins: [
      ...DEFAULT_PLUGINS,
      ...(asset.type === 'script' || asset.type === 'iife' ? SCRIPT_PLUGINS : []),
      AssetPlugin(options),
    ],
  } as esbuild.BuildOptions

  return await esbuild.context(context)
}
