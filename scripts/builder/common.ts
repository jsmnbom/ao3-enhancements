/* eslint-disable antfu/top-level-function */
import { join } from 'node:path'

import type * as esbuild from 'esbuild'
import type * as svgo from 'svgo'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

export const TARGETS = ['chrome120', 'firefox117'] as esbuild.TransformOptions['target'][]

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

export const ICON_COLLECTIONS = (src: string) => ({
  ao3e: FileSystemIconLoader(join(src, 'icons')),
})
