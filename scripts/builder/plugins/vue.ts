import { createEsbuildPlugin } from 'unplugin'
import type { UnpluginOptions } from 'unplugin'
import * as unpluginVue from 'unplugin-vue/api'
import * as unpluginVueComponents from 'unplugin-vue-components'
import * as compiler from 'vue/compiler-sfc'

interface Options extends unpluginVue.Options {
  components?: unpluginVueComponents.Options
}

export function VuePlugin(options: Options) {
  return createEsbuildPlugin((_, meta) => {
    const c = unpluginVueComponents.default.raw(options.components ?? {}, meta) as UnpluginOptions

    const esbuild = {
      onLoadFilter: /(\.vue)|(plugin-vue)/,
    }
    return [{
      name: 'fix',
      transformInclude: id => id.includes('.vue'),
      transform: code => code.replace(`//# sourceMappingURL=data:application/json;charset=utf-8;base64,W29iamVjdCBPYmplY3Rd`, ''),
      esbuild,
    }, {
      ...unpluginVue.plugin.raw({
        ...options,
        compiler,
      }, meta),
      esbuild,
    }, {
      name: c.name,
      transformInclude(id) {
        if (c.transformInclude!.call(this, id)) {
          const { query } = unpluginVue.parseVueRequest(id)
          return query && query.type !== 'style'
        }
      },
      transform: c.transform,
      esbuild,
    }] as UnpluginOptions []
  })(options)
}
