import type * as esbuild from 'esbuild'
import type { UnpluginOptions } from 'unplugin'
import * as unpluginIcons from 'unplugin-icons'

import type { OnLoadArgs } from '../utils.js'

interface Options extends Omit<unpluginIcons.Options, 'compiler'> {
  jsxImport?: string
}

export function IconsPlugin(options: Options) {
  const raw = Object.defineProperties({} as { jsx: UnpluginOptions, vue: UnpluginOptions }, {
    jsx: {
      get(this: { _jsx?: UnpluginOptions }) {
        return this._jsx = (this._jsx ?? unpluginIcons.default.raw({
          ...options,
          compiler: {
            async compiler(svg) {
              return `${options.jsxImport}\nexport default (${svg})`
            },
          },
          jsx: 'preact',
        }, { framework: 'esbuild' })) as UnpluginOptions
      },
    },
    vue: {
      get(this: { _vue?: UnpluginOptions }) {
        return this._vue = (this._vue ?? unpluginIcons.default.raw({
          ...options,
          compiler: 'vue3',
          jsx: 'preact',
        }, { framework: 'esbuild' })) as UnpluginOptions
      },
    },
  })

  return {
    name: 'icons',
    setup(build) {
      build.onResolve(
        { filter: /^~icons/ },
        ({ path, resolveDir }) => {
          if (/\.jsx$/.test(path))
            return { path, namespace: 'icons', pluginData: { resolveDir, raw: raw.jsx } }
          if (/\.vue$/.test(path))
            return { path, namespace: 'icons', pluginData: { resolveDir, raw: raw.vue } }
        },
      )

      build.onLoad(
        { filter: /.*/, namespace: 'icons' },
        async ({ path, pluginData: { resolveDir, raw } }: OnLoadArgs<{ resolveDir: string, raw: UnpluginOptions }>) => {
          if (raw.loadInclude!(path)) {
            // eslint-disable-next-line ts/no-unsafe-argument
            const result = await raw.load!.call({} as any, path)

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
