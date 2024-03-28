<script setup lang="ts">
import OptionCategory from '../OptionCategory.vue'
import OptionRow from '../OptionRow.vue'
</script>

<template>
  <OptionCategory
    title="About me"
    subtitle="Personal preferences"
  >
    <template #icon>
      <icon-mdi-information />
    </template>
    <OptionRow
      title="Reading speed"
      subtitle="Used to calculate reading times"
    />
    <OptionRow
      title="Preferred theme"
      subtitle="Used for AO3 Enhancement pages only"
    />
  </OptionCategory>
</template>
