import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { hasOwnProperty } from '@antfu/utils'
import type * as esbuild from 'esbuild'

import type { Asset, AssetData } from '../Asset.js'
import { BUILD_DIR, DIR, SRC_DIR } from '../constants.js'
import type { File } from '../utils.js'
import { logBuild } from '../utils.js'

function inlineMap(file: File, map: File) {
  let mapString = `# sourceMappingURL=data:application/json;base64,${Buffer.from(map.contents).toString('base64')}`
  if (file.fileName.endsWith('.css'))
    mapString = `/*${mapString}*/`
  else
    mapString = `//${mapString}`
  const mapBuffer = Buffer.from(`\n${mapString}`, 'utf8')
  const contents = new Uint8Array(file.contents.length + mapBuffer.length)
  contents.set(file.contents)
  contents.set(mapBuffer, file.contents.length)
  return contents
}

export interface Options {
  asset: Asset
  onStart: () => void
  onEnd: () => Promise<void>
}

export function AssetPlugin({ asset, onStart, onEnd }: Options) {
  return {
    name: 'asset',
    setup: (build) => {
      build.initialOptions.metafile = true

      build.onStart(() => {
        onStart()
      })

      build.onEnd(async ({ metafile, outputFiles }) => {
        // Remove generated .js files when the asset is not a script
        if (asset.type === 'other') {
          for (const [outputPath, meta] of Object.entries(metafile?.outputs ?? {})) {
            if (meta.entryPoint) {
              delete metafile?.outputs[outputPath]
              outputFiles = outputFiles?.filter(f => f.path !== path.join(DIR, outputPath))
            }
          }
        }

        const files = Object.fromEntries((outputFiles ?? []).map(f => [f.path, {
          fileName: f.path,
          contents: f.contents,
          size: f.contents.byteLength,
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

        // Print build info
        logBuild(asset, [...Object.values(files)], metafile)

        await fs.mkdir(path.join(BUILD_DIR, 'meta'), { recursive: true })
        await fs.writeFile(
          `${path.join(BUILD_DIR, 'meta', path.relative(DIR, asset.inputPath).replace(/\//g, '_'))}.json`,
          `${JSON.stringify(metafile, null, 2)}\n`,
        )

        // Update asset paths
        const update: AssetData = {}
        for (const [outputPath, meta] of Object.entries(metafile?.outputs ?? {})) {
          if (
            (meta.entryPoint && path.join(DIR, meta.entryPoint) === asset.inputPath)
            || (asset.type === 'other' && path.relative(SRC_DIR, asset.inputPath) === path.relative(asset.config.dist_dir, outputPath))
          )
            update.outputPath = path.join(DIR, outputPath)
          if (meta.cssBundle)
            update.cssBundlePath = path.join(DIR, meta.cssBundle)
        }

        if (update.outputPath || update.cssBundlePath)
          await asset.update(update)

        // Write files
        for (const file of Object.values(files)) {
          await fs.mkdir(path.dirname(file.fileName), { recursive: true })
          await fs.writeFile(file.fileName, file.contents)
          if (file.map)
            await fs.writeFile(file.map.fileName, file.map.contents)
        }

        await onEnd()
      })
    },
  } as esbuild.Plugin
}
