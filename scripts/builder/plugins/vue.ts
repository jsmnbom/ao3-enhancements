import ts from 'typescript'
import { createEsbuildPlugin } from 'unplugin'
import type { UnpluginOptions } from 'unplugin'
import * as unpluginVue from 'unplugin-vue/api'
import * as compiler from 'vue/compiler-sfc'

interface Options extends unpluginVue.Options {
  plugins?: (UnpluginOptions | UnpluginOptions[])[]
}

const VUE_RE = /(\.vue$)|(\.vue\?vue)|(^\0\/plugin-vue)/

export function VuePlugin(options: Options) {
  return createEsbuildPlugin(() => {
    const fixer: UnpluginOptions = {
      name: 'fix',
      transformInclude: id => VUE_RE.test(id),
      transform: code => code.replace(`//# sourceMappingURL=data:application/json;charset=utf-8;base64,W29iamVjdCBPYmplY3Rd`, ''),
      esbuild: { onLoadFilter: VUE_RE },
    }

    const vue: UnpluginOptions = {
      ...unpluginVue.plugin.raw({
        ...options,
        script: {
          ...options.script,
          fs: ts.sys,
        },
        compiler,
      }, { framework: 'esbuild' }),
      esbuild: {
        onLoadFilter: VUE_RE,
        config(options) {
          options.define ??= {}
          options.define.__VUE_OPTIONS_API__ = 'false'
          options.define.__VUE_PROD_DEVTOOLS__ = 'false'
          options.define.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = 'false'
        },
      },
    }

    const plugins = (options.plugins ?? []).flat().map(plugin => ({
      ...plugin,
      transformInclude(id: string) {
        if (plugin.transformInclude!.call(this, id)) {
          const { query } = unpluginVue.parseVueRequest(id)
          return query && query.type !== 'style'
        }
      },
      esbuild: { onLoadFilter: VUE_RE },
    } as UnpluginOptions))

    return [fixer, vue, ...plugins]
  })(options)
}
