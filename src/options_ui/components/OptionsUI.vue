<script lang="ts" setup>
import { useElementSize } from '@vueuse/core'
import { effect, onMounted, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'

import { useSize } from '../composables/useSize.js'

import { categories } from './categories/index.js'
import OptionsUIFooter from './OptionsUIFooter.vue'
import OptionsUIHeader from './OptionsUIHeader.vue'

const inner = ref<HTMLElement | null>(null)
const categoryComponents = ref<ComponentPublicInstance[] | null>(null)

onMounted(() => {
  const lastComponent = categoryComponents.value?.[categoryComponents.value.length - 1]
  if (lastComponent) {
    const lastComponentSize = useElementSize(lastComponent.$el as HTMLElement, undefined, { box: 'border-box' })
    const headerSize = useSize('header')
    const footerSize = useSize('footer')
    effect(() => {
      const innerHeight = lastComponentSize.height.value + headerSize.height.value + footerSize.height.value
      inner.value!.style.marginBottom = `calc(100vh - ${innerHeight}px)`
    })
  }
})
</script>

<template>
  <div id="outer">
    <OptionsUIHeader />
    <main id="inner" ref="inner">
      <div flex="~ col gap-5" mx-auto mt-8 container>
        <component
          :is="category"
          v-for="category, i in categories"
          ref="categoryComponents"
          :key="i"
        />
      </div>
    </main>
    <OptionsUIFooter />
  </div>
</template>
