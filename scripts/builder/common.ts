/* eslint-disable antfu/top-level-function */
import { join, resolve } from 'node:path'

import { objectMap } from '@antfu/utils'
import type * as esbuild from 'esbuild'
import * as svgo from 'svgo'
import { type UnpluginOptions, createUnplugin } from 'unplugin'
import type { Options as UnpluginIconsOptions } from 'unplugin-icons'
import icons from 'unplugin-icons'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

import pJson from '../../package.json'

import type { AssetBase } from './AssetBase.ts'

export const SVGO_CONFIG = {
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

export const TARGET = (asset: AssetBase) => asset.opts.target

export const ESBUILD = (asset: AssetBase): esbuild.CommonOptions => ({
  target: TARGET(asset),
  treeShaking: true,
  legalComments: 'none',
  minifySyntax: true,
  minifyWhitespace: process.env.NODE_ENV === 'production',
  minifyIdentifiers: process.env.NODE_ENV === 'production',
})

export const ALIAS = (asset: AssetBase): Record<string, string> => {
  return objectMap(pJson.imports, (v, k) => ([v, resolve(asset.opts.root, k)] as [string, string]))
}

export const DEFINE = (asset: AssetBase): Record<string, string> => ({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  'process.env.BROWSER': JSON.stringify(process.env.BROWSER),
  'process.env.CONTEXT': JSON.stringify(asset.type),
})

export const ICON_COLLECTIONS = (src: string) => ({
  ao3e: FileSystemIconLoader(join(src, 'icons')),
})

export const ICON_OPTIONS = (asset: AssetBase): UnpluginIconsOptions => ({
  customCollections: ICON_COLLECTIONS(asset.opts.src),
  transform: svg => svgo.optimize(svg, SVGO_CONFIG).data,
})

export const IconsPlugin = createUnplugin<UnpluginIconsOptions>((options, meta) => {
  const exts = [
    ['vue', 'vue3', ''],
    ['jsx', { compiler: (svg: string) => `import * as React from '#dom';\nexport default (${svg})` }, '.jsx'],
  ] as const

  return exts.map(([ext, compiler, resolvedExt]) => {
    const raw = icons.raw({ ...options, compiler }, meta) as UnpluginOptions
    const regexp = new RegExp(`^~icons/(.+?)\\.${ext}$`)
    return {
      name: `icons-${ext}`,
      enforce: 'pre',
      resolveId(id) {
        const m = id.match(regexp)
        return m && `~icons/${ext}/${m[1]}${resolvedExt}`
      },
      loadInclude: id => id.includes(`~icons/${ext}/`),
      async load(id) {
        const loaded = await raw.load!.call(this, id.replace(`~icons/${ext}/`, `~icons/`))
        return loaded && (loaded as { code: string }).code
      },
    } as UnpluginOptions
  })
})
