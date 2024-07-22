<script setup lang="ts">
const { enabled } = useOption('hideLanguages')
</script>

<template>
  <OptionRowCollapsable
    v-model:open="enabled"
    title="Language"
    subtitle="Hide works based on their language"
  >
    <label for="hideWorks-languages" py-1 flex="~ row items-center gap-1">
      <span font="leading-none" text="sm muted-fg">Hide works that written in languages other than</span>
      <OptionLanguage />
    </label>
  </OptionRowCollapsable>
</template>
