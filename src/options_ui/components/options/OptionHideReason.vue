<script setup lang="ts">
const optionValue = useOption('hideShowReason')
const id = OptionLabelId.inject()

const value = computed({
  get: () => optionValue.value ? 'true' : 'false',
  set: (value: string) => optionValue.value = value === 'true',
})

const [DefineBox, Box] = createReusableTemplate<{ value: string, label: string }>()
</script>

<template>
  <DefineBox v-slot="{ $slots, value, label }">
    <RadioBoxItem
      :value="value"
      :label="label"
      h-12 px-3
      font="tracking-wider"
      text="sm"
    >
      <component :is="$slots.default" />
    </RadioBoxItem>
  </DefineBox>
  <RadioBox
    :id="id"
    v-model="value"
    class="grid sm:flex cols-[min-content] gap-2"
  >
    <Box
      value="true"
      label="Show work as collapsed with a reason why it was hidden"
    >
      <span>Show reason</span>
    </Box>
    <Box
      value="false"
      label="Fully hide the work from view"
    >
      <span>Hide fully</span>
    </Box>
  </RadioBox>
</template>
