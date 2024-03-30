<script setup lang="ts">
import OptionCategory from '../OptionCategory.vue'
import OptionRow from '../OptionRow.vue'
import OptionSwitch from '../options/OptionSwitch.vue'
</script>

<template>
  <OptionCategory
    title="Blurb statistics"
    subtitle="Add or improve stats for entire works."
  >
    <template #icon>
      <icon-mdi-chart-bar aria-hidden="true" />
    </template>
    <OptionRow
      v-slot="{ id }"
      title="Reading time"
      subtitle="Add estimated reading time to work stats"
    >
      <OptionSwitch :id="id" />
    </OptionRow>
    <OptionRow
      title="Finish reading at"
      subtitle="Add estimated finish time to work stats"
    />
    <OptionRow
      title="Kudos/hits ratio"
      subtitle="Add ratio of kudos to hits to work stats"
    />
  </optioncategory>
</template>
