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
    <OptionRow
      title="Reading speed"
      subtitle="In words per minute. Used to calculate reading times"
    >
      <OptionsReadingSpeed />
    </OptionRow>
    <OptionRow
      title="Preferred theme"
      subtitle="Used for AO3 Enhancement pages only"
    >
      <OptionTheme />
    </OptionRow>
  </OptionCategory>
</template>
