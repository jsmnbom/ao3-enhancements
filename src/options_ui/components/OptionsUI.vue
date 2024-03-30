<script lang="ts" setup>
import { useElementSize } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'

import { categories } from './categories/index.js'
import OptionsUIFooter from './OptionsUIFooter.vue'
import OptionsUIHeader from './OptionsUIHeader.vue'

const refs = ref<ComponentPublicInstance[] | null>(null)

onMounted(() => {
  const last = refs.value![refs.value!.length - 1]
  const { height } = useElementSize(last.$el as HTMLElement, undefined, { box: 'border-box' })
  watch(height, () => last.$el.style.marginBottom = `calc(max(2rem, 100vh - ${height.value}px - var(--header-height) - var(--footer-height)))`)
})
</script>

<template>
  <div id="outer" color="foreground" bg="background [url(./background.svg)]">
    <OptionsUIHeader />
    <main id="inner">
      <form action="#" flex="~ col gap-5" mx-auto mt-8 container>
        <component
          :is="category"
          v-for="category, i in categories"
          ref="refs"
          :key="i"
        />
      </form>
    </main>
    <OptionsUIFooter />
  </div>
</template>

<style>
html {
  overflow-y: auto !important;
  scroll-behavior: smooth;
  scroll-padding-top: calc(var(--header-height) + 1rem);

  font-size: 16px;
  font-family: 'Lucida Grande', 'Lucida Sans Unicode', 'GNU Unifont', Verdana,
    Helvetica, sans-serif;
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
</style>
