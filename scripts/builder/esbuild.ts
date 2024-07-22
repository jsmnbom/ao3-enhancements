import fs from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

import { hasOwnProperty } from '@antfu/utils'
import * as esbuild from 'esbuild'
import * as svgo from 'svgo'

import { ICON_COLLECTIONS, ICON_TRANSFORM, SVGO_CONFIG } from '#uno.config'

import type { AssetMain } from './AssetMain.ts'
import { ALIAS, DEFINE, ESBUILD, IconsPlugin } from './common.ts'
import type { File } from './utils.ts'
import { inlineMap, logBuild, writeFile } from './utils.ts'

export async function createEsbuildContext(asset: AssetMain) {
  const context = {
    entryPoints: [asset.inputPath],
    bundle: true,
    entryNames: '[dir]/[name]',
    assetNames: '[dir]/[name]',
    chunkNames: '[dir]/[name]',
    outbase: asset.opts.src,
    outdir: asset.opts.dist,
    format: asset.type === 'content_script' ? 'iife' : 'esm',

    sourcemap: 'external',
    alias: ALIAS(asset),
    define: DEFINE(asset),
    ...ESBUILD(asset),

    loader: {
      '.ico': 'file',
      '.png': 'file',
    },

    plugins: [
      SvgPlugin({ svgoConfig: SVGO_CONFIG }),
      InlineCssPlugin(asset),
      IconsPlugin.esbuild({ customCollections: ICON_COLLECTIONS, transform: ICON_TRANSFORM }),
      AssetPlugin(asset),
    ],
  } as esbuild.BuildOptions

  return await esbuild.context(context)
}

function AssetPlugin(asset: AssetMain) {
  return {
    name: 'asset',
    setup: (build) => {
      build.initialOptions.metafile = true
      build.initialOptions.write = false

      build.onStart(() => {
        asset.onEsbuildStart()
      })

      build.onEnd(async ({ metafile, outputFiles }) => {
        // Remove generated .js files when the asset is not a script
        if (asset.type === 'other') {
          for (const [outputPath, meta] of Object.entries(metafile?.outputs ?? {})) {
            if (meta.entryPoint) {
              delete metafile?.outputs[outputPath]
              outputFiles = outputFiles?.filter(f => f.path !== join(asset.opts.root, outputPath))
              outputFiles = outputFiles?.filter(f => f.path !== join(asset.opts.root, `${outputPath}.map`))
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
        logBuild(asset.opts, asset.inputPath, [...Object.values(files)], metafile)

        // Update asset paths
        for (const [outputPath, meta] of Object.entries(metafile?.outputs ?? {})) {
          if (
            (meta.entryPoint && join(asset.opts.root, meta.entryPoint) === asset.inputPath)
            || (asset.type === 'other' && relative(asset.opts.src, asset.inputPath) === relative(asset.opts.dist, outputPath))
          )
            asset.outputPath.value = join(asset.opts.root, outputPath)
        }

        asset.onEsbuildEnd()
      })
    },
  } as esbuild.Plugin
}

function SvgPlugin({ svgoConfig }: { svgoConfig: svgo.Config }) {
  return {
    name: 'svg',
    setup(build) {
      build.onResolve(
        { filter: /\.svg$/ },
        ({ path, resolveDir }) => ({ path: resolve(resolveDir, path), pluginData: { resolveDir } }),
      )
      build.onLoad({ filter: /\.svg$/ }, async ({ path, pluginData }) => {
        const svg = await fs.readFile(path, 'utf-8')
        const optimized = svgo.optimize(svg, svgoConfig).data
        return {
          contents: optimized,
          loader: 'file' as const,
          resolveDir: (pluginData as { resolveDir: string }).resolveDir,
        }
      })
    },
  } as esbuild.Plugin
}

function InlineCssPlugin(asset: AssetMain) {
  return {
    name: 'inline-css',
    setup(build) {
      build.onResolve(
        { filter: /\.css\?inline$/ },
        ({ path, resolveDir }) => ({ path: resolve(resolveDir, path), pluginData: { resolveDir } }),
      )
      build.onLoad({ filter: /\.css\?inline$/ }, async ({ path, pluginData }) => {
        const fileName = path.slice(0, path.length - 7)
        const raw = await fs.readFile(fileName, 'utf-8')
        const css = (await build.esbuild.transform(raw, {
          loader: 'css',
          ...ESBUILD(asset),
        })).code
        return {
          contents: `export default ${JSON.stringify(css)}`,
          loader: 'js' as const,
          resolveDir: (pluginData as { resolveDir: string }).resolveDir,
          watchFiles: [fileName],
        }
      })
    },
  } as esbuild.Plugin
}
