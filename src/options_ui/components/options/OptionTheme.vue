<script setup lang="ts">
import AO3Icon from '~icons/ao3e/ao3.vue'

const { chosen } = useOption('theme')

const id = OptionLabelId.inject()

const [DefineBox, Box] = createReusableTemplate<{ value: string, label: string }>()
</script>

<template>
  <DefineBox v-slot="{ $slots, value, label }">
    <RadioBoxItem
      :value="value"
      :label="label"
      w="24 sm:12"
      h="10 sm:12"
      text="sm"
    >
      <component :is="$slots.default" />
    </RadioBoxItem>
  </DefineBox>
  <RadioBox
    :id="id"
    v-model="chosen"
    flex="~ col items-center gap-x-4 gap-y-2 sm:row"
  >
    <Box value="inherit" label="Use theme from AO3">
      <AO3Icon aria-hidden="true" text="2xl" />
    </Box>
    <Box value="light" label="Always use light theme">
      <span>Light</span>
    </Box>
    <Box value="dark" label="Always use dark theme">
      <span>Dark</span>
    </Box>
  </RadioBox>
</template>
