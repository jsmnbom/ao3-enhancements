<script setup lang="ts">
</script>

<template>
  <OptionCategory
    title="Hide works"
    subtitle="Hide works based on criteria."
  >
    <template #icon>
      <Icon i-mdi-eye-off />
    </template>
    <OptionRow
      title="Collapse/hide matching works"
      subtitle="For when you want to hide works but still see why they were hidden and have the option to show them."
    >
      <OptionHideReason />
    </OptionRow>
    <OptionDivider />
    <OptionRowHideCrossovers />
    <OptionDivider />
    <OptionRowHideLanguages />
    <OptionDivider />
    <OptionRowHideAuthors />
    <OptionDivider />
    <OptionRowHideTags />
    <OptionDivider />
  </OptionCategory>
</template>
