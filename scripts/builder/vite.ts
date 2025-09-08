import type { Ref } from '@vue/reactivity'
import type { ImportCommon } from 'unimport'
import type * as vite from 'vite'

import { hasOwnProperty } from '@antfu/utils'
import unocss from '@unocss/vite'
import vue from '@vitejs/plugin-vue'
import { Buffer } from 'node:buffer'
import { dirname, join, relative } from 'node:path'
import RekaResolver from 'reka-ui/resolver'
import { visualizer } from 'rollup-plugin-visualizer'
import { builtinPresets } from 'unimport'
import autoImport from 'unplugin-auto-import/vite'
import vueComponents from 'unplugin-vue-components/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

import { ICON_COLLECTIONS, ICON_TRANSFORM } from '#uno.config'

import type { AssetPage, ViteInput } from './AssetPage.ts'
import type { File } from './utils.ts'

import { ALIAS, DEFINE, ESBUILD, ESBUILD_TARGET, IconsPlugin, LIGHTNING_CSS_TARGET } from './common.ts'
import { logBuild, makeHash, writeFile } from './utils.ts'

const ORIGIN_PLACEHOLDER = '__VITE_ORIGIN__'

export async function createViteConfig(asset: AssetPage, inputs: ViteInput[], origin?: Ref<string | null>) {
  const { opts: { root, src, command } } = asset
  const dist = dirname(join(asset.opts.dist, relative(src, asset.inputPath)))

  return {
    configFile: false,
    root,
    base: command === 'build' ? `/${dirname(relative(src, asset.inputPath))}` : '/',
    mode: process.env.NODE_ENV,
    clearScreen: false,
    logLevel: 'warn',
    appType: 'custom',
    write: false,
    resolve: { alias: ALIAS(asset) },
    esbuild: ESBUILD(asset),
    define: {
      ...DEFINE(asset),
      __VUE_OPTIONS_API__: 'false',
    },
    server: {
      origin: ORIGIN_PLACEHOLDER,
      cors: {
        origin: [
          /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/,
          /^moz-extension:\/\//,
        ],
      },
    },
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        targets: LIGHTNING_CSS_TARGET(asset),
      },
    },
    build: {
      sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : true,
      target: ESBUILD_TARGET(asset),
      emptyOutDir: false,
      rollupOptions: {
        input: inputs.map(input => input.inputPath),
        output: {
          dir: dist,
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name][extname]',
          banner: `if (!('browser' in self)) { self.browser = self.chrome; }`,
        },
      },
    },
    plugins: [
      vue({
        script: {
          propsDestructure: true,
        },
      }),
      vueComponents({
        dirs: inputs.map(input => join(dirname(input.inputPath), 'components')),
        dts: join(src, 'types/components.d.ts'),
        resolvers: [
          RekaResolver({ prefix: 'Reka' }),
        ],
      }),
      unocss(),
      IconsPlugin.vite({ customCollections: ICON_COLLECTIONS, transform: ICON_TRANSFORM }),
      autoImport({
        parser: 'regex',
        imports: [
          { from: 'vue', imports: builtinPresets.vue.imports.filter(i => !(i as ImportCommon).type) },
          '@vueuse/core',
          { from: 'reka-ui', imports: ['useEmitAsProps', 'useForwardProps', 'useForwardPropsEmits', 'useForwardExpose'] },
        ],
        ignore: ['h'],
        defaultExportByFilename: true,
        dirs: [
          ...inputs.map(input => join(dirname(input.inputPath), 'components/**/use*.ts')),
          ...inputs.map(input => join(dirname(input.inputPath), 'composables/**')),
          ...inputs.map(input => join(dirname(input.inputPath), 'directives/**')),
        ],
        dts: join(src, 'types/auto-imports.d.ts'),
      }),
      AssetPlugin(),
      {
        name: 'origin',
        transform(code) {
          if (origin && origin.value)
            return code.replaceAll(ORIGIN_PLACEHOLDER, origin.value)
        },
      },
      visualizer(),
      ...(process.env.NODE_ENV === 'development'
        ? [vueDevTools({
            appendTo: inputs[0]!.inputPath,
          })]
        : []),
    ],
  } as vite.InlineConfig

  function AssetPlugin() {
    return {
      name: 'asset',
      async generateBundle(_, bundle) {
        const files = Object.fromEntries(Object.entries(bundle).map(([fileName, chunk]) => {
          const outputPath = join(dist, fileName)
          const source = chunk.type === 'asset' ? chunk.source : chunk.code
          const contents = typeof source == 'string' ? Buffer.from(source, 'utf-8') : source
          return [outputPath, {
            fileName: outputPath,
            contents,
            size: contents.byteLength,
            hash: makeHash(contents),
          } as File]
        }))

        for (const mapFileName of Object.keys(files)) {
          if (mapFileName.endsWith('.map')) {
            const fileName = mapFileName.replace(/\.map$/, '')
            if (hasOwnProperty(files, fileName)) {
              const file = files[fileName]
              const mapFile = files[mapFileName]
              file!.map = mapFile
            }
          }
        }

        // Write files
        for (const file of Object.values(files))
          await writeFile(file)

        // Print build info
        logBuild(asset.opts, inputs[0]!.inputPath, [...Object.values(files)])

        // Update asset paths
        for (const [fileName, chunk] of Object.entries(bundle)) {
          for (const input of inputs) {
            if (chunk.type === 'chunk' && chunk.facadeModuleId === input.inputPath) {
              input.setAttrs(join(dist, fileName), true)
              if (chunk.viteMetadata?.importedCss)
                input.cssBundlePaths = [...chunk.viteMetadata.importedCss].map(p => join(dist, p))
            }
          }
        }
      },
    } as vite.Plugin
  }
}
