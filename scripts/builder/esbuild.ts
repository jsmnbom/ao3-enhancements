import fs from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'

import { hasOwnProperty } from '@antfu/utils'
import * as esbuild from 'esbuild'
import * as svgo from 'svgo'
import type { UnpluginOptions } from 'unplugin'
import * as unpluginIcons from 'unplugin-icons'

import type { AssetMain } from './AssetMain.js'
import { ICON_COLLECTIONS, SVGO_CONFIG } from './common.js'
import type { File } from './utils.js'
import { inlineMap, logBuild, writeFile } from './utils.js'

export async function createEsbuildContext(asset: AssetMain) {
  const context = {
    entryPoints: [asset.inputPath],
    bundle: true,
    entryNames: '[dir]/[name]',
    assetNames: '[dir]/[name]',
    chunkNames: '[dir]/[name]',
    outbase: asset.args.src,
    outdir: asset.args.dist,
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
      SvgPlugin({ svgoConfig: SVGO_CONFIG }),
      ...(asset.type === 'script' || asset.type === 'iife'
        ? [
            IconsPlugin({
              jsxImport: `import * as React from '#dom';`,
              customCollections: ICON_COLLECTIONS(asset.args.src),
              transform: svg => svgo.optimize(svg, SVGO_CONFIG).data,
            }),
          ]
        : []),
      AssetPlugin(),
    ],
  } as esbuild.BuildOptions

  return await esbuild.context(context)

  function AssetPlugin() {
    return {
      name: 'asset',
      setup: (build) => {
        build.initialOptions.metafile = true

        build.onStart(() => {
          asset.onEsbuildStart()
        })

        build.onEnd(async ({ metafile, outputFiles }) => {
          // Remove generated .js files when the asset is not a script
          if (asset.type === 'other') {
            for (const [outputPath, meta] of Object.entries(metafile?.outputs ?? {})) {
              if (meta.entryPoint) {
                delete metafile?.outputs[outputPath]
                outputFiles = outputFiles?.filter(f => f.path !== join(asset.args.root, outputPath))
              }
            }
          }

          const files = Object.fromEntries((outputFiles ?? []).map(f => [f.path, {
            fileName: f.path,
            contents: f.contents,
            size: f.contents.byteLength,
            hash: f.hash,
          } as File]))

          for (const mapFileName of Object.keys(files)) {
            if (mapFileName.endsWith('.map')) {
              const fileName = mapFileName.replace(/\.map$/, '')
              if (hasOwnProperty(files, fileName)) {
                const file = files[fileName]
                const mapFile = files[mapFileName]
                file.map = mapFile

                // Inline source maps in development
                if (process.env.NODE_ENV === 'development') {
                  file.contents = inlineMap(file, mapFile)
                  delete files[mapFileName]
                }
              }
            }
          }

          // Write files
          for (const file of Object.values(files))
            await writeFile(file)

          // Print build info
          logBuild(asset.args, asset.inputPath, [...Object.values(files)], metafile)

          // Update asset paths
          for (const [outputPath, meta] of Object.entries(metafile?.outputs ?? {})) {
            if (
              (meta.entryPoint && join(asset.args.root, meta.entryPoint) === asset.inputPath)
              || (asset.type === 'other' && relative(asset.args.src, asset.inputPath) === relative(asset.args.dist, outputPath))
            )
              asset.outputPath.value = join(asset.args.root, outputPath)
          }

          asset.onEsbuildEnd()
        })
      },
    } as esbuild.Plugin
  }
}

function SvgPlugin({ svgoConfig }: { svgoConfig: svgo.Config }) {
  return {
    name: 'svg',
    setup(build) {
      build.onResolve({ filter: /\.svg$/ }, ({ path, resolveDir }) => ({ path: resolve(resolveDir, path), pluginData: { resolveDir } }))
      build.onLoad({ filter: /\.svg$/ }, async (args) => {
        const { path, pluginData: { resolveDir } } = args as Omit<esbuild.OnLoadArgs, 'pluginData'> & { pluginData: { resolveDir: string } }
        const svg = await fs.readFile(path, 'utf-8')
        const optimized = svgo.optimize(svg, svgoConfig).data
        return { contents: optimized, loader: 'file' as const, resolveDir }
      })
    },
  } as esbuild.Plugin
}

function IconsPlugin(options: Omit<unpluginIcons.Options, 'compiler'> & {
  jsxImport?: string
}) {
  const jsx = unpluginIcons.default.raw({
    ...options,
    compiler: {
      async compiler(svg) {
        return `${options.jsxImport}\nexport default (${svg})`
      },
    },
    jsx: 'preact',
  }, { framework: 'esbuild' }) as UnpluginOptions

  return {
    name: 'icons',
    setup(build) {
      build.onResolve(
        { filter: /^~icons/ },
        ({ path, resolveDir }) => {
          if (/\.jsx$/.test(path))
            return { path, namespace: 'icons', pluginData: { resolveDir } }
        },
      )

      build.onLoad(
        { filter: /.*/, namespace: 'icons' },
        async (args) => {
          const { path, pluginData: { resolveDir } } = args as Omit<esbuild.OnLoadArgs, 'pluginData'> & { pluginData: { resolveDir: string } }
          if (jsx.loadInclude!(path)) {
            // eslint-disable-next-line ts/no-unsafe-argument
            const result = await jsx.load!.call({} as any, path)

            if (result) {
              return {
                // Ignore sourcemap completely, since it will just be nothing anyway
                contents: typeof result === 'string' ? result : (result && result.code),
                loader: 'jsx' as const,
                resolveDir,
              }
            }
          }
        },
      )
    },
  } as esbuild.Plugin
}
