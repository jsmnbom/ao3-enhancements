/* eslint-disable antfu/top-level-function */
import { join } from 'node:path'

import type * as svgo from 'svgo'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

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
