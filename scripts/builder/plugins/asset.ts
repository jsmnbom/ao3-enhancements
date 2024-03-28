import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'

import { partition } from '@antfu/utils'
import type * as esbuild from 'esbuild'

import type { Asset, AssetData } from '../Asset.js'
import { DIR, SRC_DIR } from '../constants.js'
import { colorizePath, logBuild, logTime } from '../utils.js'

interface File {
  fileName: string
  contents: Uint8Array
  size: number
  mapSize?: number

}

function inlineMap(file: File, map: string) {
  let mapString = `# sourceMappingURL=data:application/json;base64,${Buffer.from(map, 'utf8').toString('base64')}`
  if (file.fileName.endsWith('.css'))
    mapString = `/*${mapString}*/`
  else
    mapString = `//${mapString}`
  const mapBuffer = Buffer.from(`\n${mapString}`, 'utf8')
  const r = new Uint8Array(file.contents.length + mapBuffer.length)
  r.set(file.contents)
  r.set(mapBuffer, file.contents.length)
  return { contents: r, mapSize: mapBuffer.length }
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
      build.onEnd(async (result) => {
        await finish(result)
        await onEnd()
      })
    },
  } as esbuild.Plugin

  async function finish(result: esbuild.BuildResult<esbuild.BuildOptions>) {
    // Remove generated .js files when the asset is not a script
    if (asset.type === 'other') {
      for (const [outputPath, meta] of Object.entries(result.metafile?.outputs ?? {})) {
        if (meta.entryPoint) {
          delete result.metafile?.outputs[outputPath]
          result.outputFiles = result.outputFiles?.filter(f => f.path !== path.join(DIR, outputPath))
        }
      }
    }

    // Inline sourcemaps and calculate sizes
    const files: Record<string, File> = {}
    const [maps, nonMaps] = partition(result.outputFiles ?? [], f => f.path.endsWith('.map'))

    for (const file of nonMaps) {
      files[file.path] = {
        fileName: file.path,
        contents: file.contents,
        size: file.contents.byteLength,
      }
    }

    for (const mapFile of maps) {
      const jsPath = mapFile.path.replace(/\.map$/, '')
      if (files[jsPath]) {
        const map = JSON.parse(mapFile.text) as { mappings: string }
        if (map.mappings !== '')
          Object.assign(files[jsPath], inlineMap(files[jsPath], mapFile.text))
      }
    }

    // Print build info
    logBuild(asset, [...Object.values(files)])

    // Update asset paths
    const update: AssetData = {}
    for (const [outputPath, meta] of Object.entries(result.metafile?.outputs ?? {})) {
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
    }
  }
}
