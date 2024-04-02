import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'

import { objectPick } from '@antfu/utils'
import { createFilter } from '@rollup/pluginutils'
import type * as esbuild from 'esbuild'
import type { UserConfig } from 'unocss'
import { createGenerator } from 'unocss'

import type { OnLoadArgs } from '../utils'

const PLACEHOLDER = `@unocss-placeholder;`

export function UnocssPlugin<Theme extends object>(options: UserConfig<Theme>) {
  return {
    name: 'unocss',
    setup(build) {
      const generator = createGenerator(options)
      const tokens = new Map<string, Set<string>>()
      const filter = createFilter(
        (options.content?.pipeline) ? options.content.pipeline.include || [] : [],
        (options.content?.pipeline) ? options.content.pipeline.exclude || [] : [],
      )

      build.onResolve({ filter: /^uno.css$/ }, async ({ path }: esbuild.OnResolveArgs) => ({ path, namespace: 'unocss' }))
      build.onLoad({ filter: /^uno.css$/, namespace: 'unocss' }, () => ({ contents: PLACEHOLDER, loader: 'css' }))

      build.onLoad({ filter: /.*/, namespace: 'file' }, async (args: OnLoadArgs<Record<string, never>>) => {
        if (filter(args.path)) {
          const contents = await fs.readFile(args.path, 'utf-8')
          tokens.set(args.path, await generator.applyExtractors(contents, args.path))
        }
        return null
      })

      build.onEnd(async ({ outputFiles }) => {
        for (const file of outputFiles ?? []) {
          if (file.path.endsWith('.css') && file.text.includes(PLACEHOLDER)) {
            const allTokens = new Set((function *() {
              for (const t of tokens.values())
                yield * t
            })())
            const generated = await generator.generate(allTokens)
            const css = (await build.esbuild.transform(generated.css, {
              loader: 'css',
              ...objectPick(build.initialOptions, ['target', 'minify', 'minifyIdentifiers', 'minifySyntax', 'minifyWhitespace']),
            })).code
            // TODO: Use sourcemap
            file.contents = Buffer.from(file.text.replace(PLACEHOLDER, css), 'utf-8')
          }
        }
      })
    },
  } as esbuild.Plugin
}
