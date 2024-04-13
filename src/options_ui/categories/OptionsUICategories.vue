<script lang="ts" setup>
import AboutMe from './AboutMe.vue'
import Advanced from './Advanced.vue'
import BlurbStats from './BlurbStats.vue'
import ChapterStats from './ChapterStats.vue'
import HideWorks from './HideWorks.vue'
import StyleTweaks from './StyleTweaks.vue'

const lastRef = ref<ComponentPublicInstance | null>(null)
const { height: lastHeight } = useElementSize(computed(() => lastRef.value?.$el), undefined, { box: 'border-box' })
</script>

<template>
  <form
    flex="~ col gap8"
    px="2 md:4"
    :style="{ marginBottom: `calc(max(0px, 100vh - ${lastHeight}px - var(--header-height) - var(--footer-height)))` }"
    @submit.prevent
  >
    <AboutMe />
    <BlurbStats />
    <ChapterStats />
    <HideWorks />
    <StyleTweaks />
    <Advanced ref="lastRef" />
  </form>
</template>
