import { hasOwnProperty } from '@antfu/utils'
import unocss from '@unocss/vite'
import vue from '@vitejs/plugin-vue'
import type { Ref } from '@vue/reactivity'
import { Buffer } from 'node:buffer'
import { dirname, join, relative, resolve } from 'node:path'
import RekaResolver from 'reka-ui/resolver'
import { visualizer } from 'rollup-plugin-visualizer'
import type { ImportCommon } from 'unimport'
import { builtinPresets } from 'unimport'
import autoImport from 'unplugin-auto-import/vite'
import vueComponents from 'unplugin-vue-components/vite'
import type * as vite from 'vite'

import { ICONS_CUSTOM_COLLECTIONS, ICONS_TRANSFORM } from '#uno.config'

import type { AssetPage, ViteInput } from './AssetPage.ts'
import type { File } from './utils.ts'

import { ALIAS, DEFINE, ESBUILD, ESBUILD_TARGET, IconsPlugin, LIGHTNING_CSS_TARGET } from './common.ts'
import { logBuild, makeHash, writeFile } from './utils.ts'

const ORIGIN_PLACEHOLDER = '__VITE_ORIGIN__'

/**
 * Guarantee a usable `localStorage` global before vue-devtools loads. Node 25
 * defines `localStorage` by default but leaves its methods unavailable unless
 * `--localstorage-file` is set, which makes @vue/devtools-kit throw at import.
 * A tiny in-memory shim is all the build/serve process needs.
 */
function ensureLocalStorage(): void {
  const current = (globalThis as { localStorage?: { getItem?: unknown } }).localStorage
  if (current && typeof current.getItem === 'function')
    return

  const store = new Map<string, string>()
  const shim = {
    get length() { return store.size },
    clear() { store.clear() },
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => { store.delete(key) },
    setItem: (key: string, value: string) => { store.set(key, String(value)) },
  }
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: shim })
}

export async function createViteConfig(asset: AssetPage, inputs: ViteInput[], origin?: Ref<string | null>) {
  const { opts: { root, src, command } } = asset
  const dist = dirname(join(asset.opts.dist, relative(src, asset.inputPath)))

  // Imported lazily: vite-plugin-vue-devtools pulls in @vue/devtools-kit, which
  // reads `localStorage` at import time. Node 25 defines a `localStorage` global
  // (and `navigator`, so the lib assumes a browser) but leaves its methods
  // unavailable without `--localstorage-file`, so the import otherwise throws
  // "localStorage.getItem is not a function". Shim it, and only load in dev.
  let devtoolsPlugins: vite.PluginOption[] = []
  if (process.env.NODE_ENV === 'development') {
    ensureLocalStorage()
    const { default: VueDevtools } = await import('vite-plugin-vue-devtools')
    devtoolsPlugins = [VueDevtools({ appendTo: inputs[0]!.inputPath })]
  }

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
    // esbuild is still used by vite for pre-checks
    esbuild: {... ESBUILD(asset), jsx: 'preserve' },
    oxc: { target: ESBUILD_TARGET(asset), jsx: { runtime: 'classic' } },
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
      chunkSizeWarningLimit: 1024,
      rolldownOptions: {
        input: inputs.map(input => input.inputPath),
        output: {
          dir: dist,
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name][extname]',
          banner: `if (!('browser' in self)) { self.browser = self.chrome; }`,
          minify: {
            codegen: {
              removeWhitespace: false,
              legalComments: 'inline',
            },
            compress: true,
            mangle: false
          }
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
      IconsPlugin.vite({
        customCollections: ICONS_CUSTOM_COLLECTIONS,
        transform: ICONS_TRANSFORM,
      }),
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
      visualizer({
        filename: join(asset.opts.dist, relative(src, asset.inputPath).replace(/\.html?$/, '.stats.html')),
      }),
      ...devtoolsPlugins,
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
            // Rollup normalizes facadeModuleId to forward slashes; input.inputPath
            // uses OS separators. Compare via resolve() so they match on Windows.
            if (chunk.type === 'chunk' && chunk.facadeModuleId && resolve(chunk.facadeModuleId) === resolve(input.inputPath)) {
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
