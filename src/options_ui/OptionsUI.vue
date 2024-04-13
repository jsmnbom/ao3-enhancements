<script lang="ts" setup>
import OptionsUICategories from './categories/OptionsUICategories.vue'

const ready = useOptionsReady()
const themeOption = useOption('theme')

watch(themeOption, () => {
  const current = themeOption.value.chosen === 'inherit' ? themeOption.value.current : themeOption.value.chosen
  document.body.classList.toggle('dark', current === 'dark')
  document.body.classList.toggle('light', current === 'light')
}, { deep: true, immediate: true })

watch(ready, () => document.body.classList.toggle('ready', ready.value), { immediate: true })
</script>

<template>
  <RadixTooltipProvider :delay-duration="300">
    <Sonner />
    <template v-if="ready">
      <OptionsUIHeader />
      <main id="main" mx-auto card sm:pt-4 container shadow-md>
        <OptionsUICategories />
      </main>
      <OptionsUIFooter />
    </template>
  </RadixTooltipProvider>
</template>

<style>
html {
  overflow-y: auto !important;
  scroll-behavior: smooth;
  scroll-padding-top: calc(var(--header-height, 0));

  font-size: 16px;

  --at-apply: font-sans;
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

body.ready {
  background-color: rgb(var(--color-default));
  background-image: url(../img/options-background.svg);
}

.bg-ao3 {
  background-color: rgb(var(--color-primary));
  background-image: url(../img/red-ao3.png);
}
</style>
