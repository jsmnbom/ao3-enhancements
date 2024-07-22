<script setup lang="ts">

</script>

<template>
  <OptionCategory
    title="Advanced"
    subtitle="Advanced settings most users don't need"
  >
    <template #icon>
      <Icon i-mdi-alert-decagram-outline />
    </template>
    <OptionRowImportExport />
    <OptionRow
      title="Debug mode"
      subtitle="Enable debug mode to see more information in the web developer console"
    >
      <OptionSwitch option-id="verbose" />
    </OptionRow>
  </OptionCategory>
</template>
