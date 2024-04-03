<script setup lang="ts">

</script>

<template>
  <OptionCategory
    title="About me"
    subtitle="Personal preferences"
  >
    <template #icon>
      <icon-mdi-information aria-hidden="true" />
    </template>
    <OptionRowReadingSpeed />
    <div border="b-1 op50" mx-8 />
    <OptionRow
      title="Preferred theme"
      subtitle="Used for AO3 Enhancement pages only"
    >
      <OptionTheme />
    </OptionRow>
  </OptionCategory>
</template>
