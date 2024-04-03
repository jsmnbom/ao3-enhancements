<script setup lang="ts">
import AO3Icon from '~icons/ao3e/ao3.vue'

const optionValue = useOption('theme')
const id = OptionLabelId.inject()

const [DefineBox, Box] = createReusableTemplate<{ value: string, label: string }>()
</script>

<template>
  <DefineBox v-slot="{ $slots, value, label }">
    <RadioBoxItem
      :value="value"
      :label="label"
      h-12 w-12 text="xl"
    >
      <component :is="$slots.default" />
    </RadioBoxItem>
  </DefineBox>
  <RadioBox
    :id="id"
    v-model="optionValue.chosen"
    flex="~ row items-center gap-5"
  >
    <Box value="inherit" label="Use theme from AO3">
      <AO3Icon text="2xl" />
    </Box>
    <Box value="light" label="Always use light theme">
      <icon-mdi-lightbulb-on aria-hidden="true" />
    </Box>
    <Box value="dark" label="Always use dark theme">
      <icon-mdi-moon-waning-crescent aria-hidden="true" />
    </Box>
  </RadioBox>
</template>
