<script setup lang="ts">
import OptionCategory from '../OptionCategory.vue'
import OptionRow from '../OptionRow.vue'
</script>

<template>
  <OptionCategory
    title="Style tweaks"
    subtitle="Make reading easier!"
    icon="mdi-format-paint"
  >
    <template #icon>
      <icon-mdi-palette aria-hidden="true" />
    </template>
    <OptionRow
      title="Decrease width of work text"
      subtitle="Makes reading on wide screens easier"
    />
    <OptionRow
      title="Force alligment of work text"
      subtitle="Can help with readability"
    />
    <OptionRow
      title="Show stats as columns"
      subtitle="Applies to both work and chapter stats"
    />
  </OptionCategory>
</template>
