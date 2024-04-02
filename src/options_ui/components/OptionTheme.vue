<script setup lang="ts">
const optionValue = useOption('theme')
const id = OptionLabelId.inject()
</script>

<template>
  <RadixRadioGroupRoot
    :id="id"
    v-model="optionValue.chosen"
    flex="~ row items-center gap-5"
  >
    <OptionThemeItem
      value="inherit"
      label="Use theme from AO3"
    >
      <span>ao3</span>
    </OptionThemeItem>
    <OptionThemeItem
      value="light"
      label="Always use light theme"
    >
      <icon-mdi-lightbulb-on aria-hidden="true" />
    </OptionThemeItem>
    <OptionThemeItem
      value="dark"
      label="Always use dark theme"
    >
      <icon-mdi-moon-waning-crescent aria-hidden="true" />
    </OptionThemeItem>
  </RadixRadioGroupRoot>
</template>
