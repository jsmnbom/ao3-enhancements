<script setup lang="ts">
const { chosen } = useOption('theme')

const id = OptionLabelId.inject()

const [DefineBox, Box] = createReusableTemplate<{ value: string, label: string }>()
</script>

<template>
  <DefineBox v-slot="{ $slots, value, label }">
    <RadioBoxItem
      :value="value"
      :label="label"
      w="16 sm:12"
      h="10 sm:12"
      text="xs"
    >
      <component :is="$slots.default" />
    </RadioBoxItem>
  </DefineBox>
  <RadioBox
    :id="id"
    v-model="chosen"
    flex="~ col items-center gap-2 sm:row!"
  >
    <Box value="inherit" label="Use theme from AO3">
      <Icon i-ao3e-ao3 text="2xl" label="AO3" />
    </Box>
    <Box value="light" label="Always use light theme">
      <span>Light</span>
    </Box>
    <Box value="dark" label="Always use dark theme">
      <span>Dark</span>
    </Box>
  </RadioBox>
</template>
