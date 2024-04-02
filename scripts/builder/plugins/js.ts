import escapeStringRegexp from 'escape-string-regexp'
import { createEsbuildPlugin } from 'unplugin'
import type { UnpluginOptions } from 'unplugin'

import { SRC_DIR } from '../constants.js'

interface Options {
  plugins?: (UnpluginOptions | UnpluginOptions[])[]
}

export function JsPlugin(options: Options) {
  return createEsbuildPlugin(() => {
    const plugins = (options.plugins ?? []).flat().map(plugin => ({
      ...plugin,
      esbuild: { onLoadFilter: new RegExp(`${escapeStringRegexp(SRC_DIR)}.+[tj]sx?$`) },
    } as UnpluginOptions))

    return [...plugins]
  })(options)
}
