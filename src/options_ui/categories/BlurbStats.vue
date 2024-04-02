<script setup lang="ts">

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
      title="Reading time"
      subtitle="Add estimated reading time to work stats"
    >
      <OptionSwitch />
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
