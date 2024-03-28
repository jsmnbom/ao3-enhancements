<script setup lang="ts">
import OptionCategory from '../OptionCategory.vue'
import OptionNote from '../OptionNote.vue'
import OptionRow from '../OptionRow.vue'
</script>

<template>
  <OptionCategory
    title="Chapter statistics"
    subtitle="Add statistics to each chapter when reading."
  >
    <template #icon>
      <icon-mdi-file-chart />
    </template>
    <OptionNote>
      <p>If any of the below are enabled, a new block for chapter specific statistic will show up when reading.</p>
    </OptionNote>
    <OptionRow
      title="Word Count"
      subtitle="Add word count to chapter stats"
    />
    <OptionRow
      title="Reading time"
      subtitle="Add estimated reading time to chapter stats"
    />
    <OptionRow
      title="Finish reading at"
      subtitle="Add estimated finish time to chapter stats"
    />
    <OptionRow
      title="Kudos/hits ratio"
      subtitle="Add ratio of kudos to hits to chapter stats"
    />
  </OptionCategory>
</template>
