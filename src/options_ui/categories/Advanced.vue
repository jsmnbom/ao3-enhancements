<script setup lang="ts">

</script>

<template>
  <OptionCategory
    title="Advanced"
    subtitle="Advanced settings most users don't need"
  >
    <template #icon>
      <icon-mdi-alert-decagram-outline aria-hidden="true" />
    </template>
    <OptionRow
      title="Data import/export"
      subtitle=""
    />
    <OptionRow
      title="Debug mode"
      subtitle="Enable debug mode to see more information in the web developer console"
    />
  </OptionCategory>
</template>
