import RadixVueResolver from 'radix-vue/resolver'
import { createEsbuildPlugin } from 'unplugin'
import type { UnpluginOptions } from 'unplugin'
import * as unpluginVue from 'unplugin-vue/api'
import * as unpluginVueComponents from 'unplugin-vue-components'

interface Options extends unpluginVue.Options {
  components?: unpluginVueComponents.Options
}

export function VuePlugin(options: Options) {
  return createEsbuildPlugin((_, meta) => {
    const c = unpluginVueComponents.default.raw(options.components ?? {}, meta) as UnpluginOptions

    return [
      {
        name: 'fix',
        transformInclude(id) {
          return id.includes('.vue')
        },
        transform(code, id) {
          return code.replace(`//# sourceMappingURL=data:application/json;charset=utf-8;base64,W29iamVjdCBPYmplY3Rd`, '')
        },
        esbuild: {
          onLoadFilter: /\.vue/,
        },
      } as UnpluginOptions,
      {
        ...unpluginVue.plugin.raw(options, meta),
        esbuild: {
          onLoadFilter: /(\.vue)|(plugin-vue)/,
        },
      },
      {
        name: c.name,
        transformInclude(id) {
          if (c.transformInclude!.call(this, id)) {
            const { query } = unpluginVue.parseVueRequest(id)
            return query && query.type !== 'style'
          }
        },
        transform: c.transform,
        esbuild: {
          onLoadFilter: /\.vue/,
        },
      },
    ]
  })(options)
}
