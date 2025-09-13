import type * as esbuild from 'esbuild'
import type { UnpluginOptions } from 'unplugin'
import type { Options as UnpluginIconsOptions } from 'unplugin-icons'

import { objectMap } from '@antfu/utils'
import { resolve } from 'node:path'
import { createUnplugin } from 'unplugin'
import icons from 'unplugin-icons'

import type { AssetBase } from './AssetBase.ts'

import pJson from '../../package.json' with { type: 'json' }

export const BROWSERS = ['chrome', 'firefox'] as const
export type Browser = typeof BROWSERS[number]

export const ESBUILD_TARGET = (asset: AssetBase) => Object.entries(asset.opts.target).map(([k, v]) => `${k}${v}`).join(' ')
export const LIGHTNING_CSS_TARGET = (asset: AssetBase) => objectMap(asset.opts.target, (k, v) => ([k, (v << 16)]))

export const ESBUILD = (asset: AssetBase): esbuild.CommonOptions => ({
  target: ESBUILD_TARGET(asset),
  treeShaking: true,
  legalComments: 'none',
  minifySyntax: true,
  platform: 'neutral',
  minifyWhitespace: false,
  minifyIdentifiers: false,
})

export const ALIAS = (asset: AssetBase): Record<string, string> => {
  return objectMap(pJson.imports, (v, k) => ([v, resolve(asset.opts.root, k)] as [string, string]))
}

export const DEFINE = (asset: AssetBase): Record<string, string> => ({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  'process.env.BROWSER': JSON.stringify(process.env.BROWSER),
  'process.env.CONTEXT': JSON.stringify(asset.type),
})

export const IconsPlugin = createUnplugin<UnpluginIconsOptions>((options, meta) => {
  const ext = 'jsx'
  const raw = icons.raw({
    ...options,
    autoInstall: true,
    compiler: { compiler: (svg: string) => `import * as React from '#dom';\nexport default (${svg})` },
  }, meta) as UnpluginOptions
  const regexp = new RegExp(`^~icons/(.+?)\\.${ext}$`)
  return {
    name: `icons-${ext}`,
    enforce: 'pre',
    resolveId(id) {
      const m = id.match(regexp)
      return m && `~icons/${ext}/${m[1]}.jsx`
    },
    loadInclude: id => id.includes(`~icons/${ext}/`),
    async load(id) {
      const handler = 'handler' in raw.load! ? raw.load!.handler : raw.load!
      const loaded = await handler.call(this, id.replace(`~icons/${ext}/`, `~icons/`))
      return loaded && (loaded as { code: string }).code
    },
  } as UnpluginOptions
})
