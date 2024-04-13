import type { Args } from './args.ts'
import type { AssetBase, AssetType } from './AssetBase.ts'
import { AssetMain } from './AssetMain.ts'
import { AssetManifest } from './AssetManifest.ts'
import { AssetPage } from './AssetPage.ts'
import { HTML_RE, RegexMap, SCRIPT_RE, STYLE_RE } from './utils.ts'

const ASSET_CACHE = new Map<string, AssetBase>()

const ASSET_TYPE_MAP = new RegexMap([
  [SCRIPT_RE, 'script'],
  [STYLE_RE, 'style'],
  [HTML_RE, 'page'],
], 'other')

export function createAsset(inputPath: string, args: Args, type?: AssetType) {
  if (ASSET_CACHE.has(inputPath))
    return ASSET_CACHE.get(inputPath)!

  type = type ?? ASSET_TYPE_MAP.get(inputPath)

  let asset: AssetBase
  if (type === 'manifest')
    asset = new AssetManifest(inputPath, args, type)
  else if (type === 'page')
    asset = new AssetPage(inputPath, args, type)
  else
    asset = new AssetMain(inputPath, args, type)

  ASSET_CACHE.set(inputPath, asset)
  return asset
}
