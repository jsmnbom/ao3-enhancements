<script setup lang="ts">
import OptionCategory from '../OptionCategory.vue'
</script>

<template>
  <OptionCategory
    title="Hide works"
    subtitle="Hide works based on criteria."
  >
    <template #icon>
      <icon-mdi-eye-off aria-hidden="true" />
    </template>
  </OptionCategory>
</template>
