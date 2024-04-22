<script setup lang="ts">

</script>

<template>
  <OptionCategory
    title="About me"
    subtitle="Personal preferences"
  >
    <template #icon>
      <Icon i-mdi-information />
    </template>
    <OptionRowNumberSlider
      title="Reading speed"
      subtitle="In words per minute. Used to calculate reading times"
      option-id="wordsPerMinute"
      unit="&nbsp;WPM"
      :min="0"
      :slider-min="50"
      :slider-max="1000"
    />
    <OptionDivider />
    <OptionRow
      title="Preferred theme"
      subtitle="Used for AO3 Enhancement pages only; AO3 option is based on your current site skin"
    >
      <OptionTheme />
    </OptionRow>
  </OptionCategory>
</template>
