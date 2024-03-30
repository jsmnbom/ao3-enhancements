<script setup lang="ts">
import OptionCategory from '../OptionCategory.vue'
import OptionRow from '../OptionRow.vue'
import OptionTheme from '../options/OptionTheme.vue'
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
      subtitle="Used to calculate reading times"
    />
    <OptionRow
      v-slot="{ id }"
      title="Preferred theme"
      subtitle="Used for AO3 Enhancement pages only"
    >
      <OptionTheme :id="id" />
    </OptionRow>
  </OptionCategory>
</template>
