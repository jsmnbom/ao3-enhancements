import { Buffer } from 'node:buffer'
import { dirname, join, relative } from 'node:path'
import process from 'node:process'

import { hasOwnProperty } from '@antfu/utils'
import vue from '@vitejs/plugin-vue'
import * as svgo from 'svgo'
import unocss from 'unocss/vite'
import autoImport from 'unplugin-auto-import/vite'
import IconResolver from 'unplugin-icons/resolver'
import icons from 'unplugin-icons/vite'
import vueComponents from 'unplugin-vue-components/vite'
import type * as vite from 'vite'

import type { AssetPage, ViteInput } from './AssetPage'
import { ICON_COLLECTIONS, SVGO_CONFIG } from './common.js'
import { type File, logBuild, makeHash, writeFile } from './utils.js'

const ORIGIN_PLACEHOLDER = '__VITE_ORIGIN__'

export async function createViteConfig(asset: AssetPage, inputs: ViteInput[], origin?: Ref<string | null>) {
  const { args: { root, src } } = asset
  const dist = dirname(join(asset.args.dist, relative(src, asset.inputPath)))

  return {
    configFile: false,
    root,
    mode: process.env.NODE_ENV,
    clearScreen: false,
    logLevel: 'warn',
    appType: 'custom',
    write: false,
    build: {
      sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : true,
      target: ['chrome120', 'firefox117'],
      emptyOutDir: false,
      rollupOptions: {
        input: inputs.map(input => input.inputPath),
        output: {
          dir: dist,
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name][extname]',
        },
      },
    },
    plugins: [
      vue(),
      vueComponents({
        dirs: inputs.map(input => join(dirname(input.inputPath), 'components')),
        dts: join(src, 'components.d.ts'),
        resolvers: [
          (name: string) => {
            const m = name.match(/^Radix(.+)$/)
            return m && { name: `${m[1]}`, from: 'radix-vue' }
          },
          IconResolver({
            prefix: 'icon',
            customCollections: Object.keys(ICON_COLLECTIONS(src)),
            extension: '.vue',
          }),
        ],
      }),
      unocss(),
      icons({
        compiler: 'vue3',
        customCollections: ICON_COLLECTIONS(src),
        transform: svg => svgo.optimize(svg, SVGO_CONFIG).data,
      }),
      autoImport({
        parser: 'regex',
        imports: [
          'vue',
          '@vueuse/core',
          { from: 'radix-vue', imports: ['useEmitAsProps', 'useForwardProps', 'useForwardPropsEmits', 'useForwardExpose'] },
          { from: 'vue-sonner', imports: ['toast'] },
        ],
        ignore: ['h'],
        dirs: [
          ...inputs.map(input => join(dirname(input.inputPath), 'composables')),
          ...inputs.map(input => join(dirname(input.inputPath), 'directives')),
        ],
        dts: join(src, 'auto-imports.d.ts'),
      }),
      AssetPlugin(),
      {
        name: 'origin',
        config: () => ({
          server: {
            origin: ORIGIN_PLACEHOLDER,
          },
        }),
        transform(code, id) {
          if (origin && origin.value)
            return replaceAll(ORIGIN_PLACEHOLDER, origin.value, code)
          function replaceAll(find: string, replace: string, subject: string): string {
            return subject.split(find).join(replace)
          }
        },
      },
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
              file.map = mapFile
            }
          }
        }

        // Write files
        for (const file of Object.values(files))
          await writeFile(file)

        // Print build info
        logBuild(asset.args, inputs[0].inputPath, [...Object.values(files)])

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
