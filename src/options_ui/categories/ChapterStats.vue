<script setup lang="ts">
</script>

<template>
  <OptionCategory
    title="Chapter statistics"
    subtitle="Add statistics to each chapter when reading. Shows a block for each chapter if any are enabled."
  >
    <template #icon>
      <Icon i-mdi-file-chart />
    </template>
    <OptionRow
      title="Word Count"
      subtitle="Add word count to chapter stats"
    >
      <OptionSwitch option-id="showChapterWords" />
    </OptionRow>
    <OptionDivider />
    <OptionRow
      title="Reading time"
      subtitle="Add estimated reading time to chapter stats"
    >
      <OptionSwitch option-id="showChapterTime" />
    </OptionRow>
    <OptionDivider />
    <OptionRow
      title="Finish reading at"
      subtitle="Add estimated finish time to chapter stats"
    >
      <OptionSwitch option-id="showChapterFinish" />
    </OptionRow>
    <OptionDivider />
    <OptionRow
      title="Updated date"
      subtitle="Add last updated date to chapter stats"
    >
      <OptionSwitch option-id="showChapterDate" />
    </OptionRow>
  </OptionCategory>
</template>
