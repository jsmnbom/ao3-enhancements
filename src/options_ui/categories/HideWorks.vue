<script setup lang="ts">
</script>

<template>
  <OptionCategory
    title="Hide works"
    subtitle="Hide works based on criteria."
  >
    <template #icon>
      <icon-mdi-eye-off aria-hidden="true" />
    </template>
    <OptionRow
      title="Collapse/hide matching works"
      subtitle="For when you want to hide works but still see why they were hidden and have the option to show them."
    >
      <OptionHideReason />
    </OptionRow>
  </OptionCategory>
</template>
