<script setup lang="ts">
const optionValue = useOption('hideShowReason')
const id = OptionLabelId.inject()

const value = computed({
  get: () => optionValue ? 'true' : 'false',
  set: (value: string) => optionValue.value = value === 'true',
})
</script>

<template>
  <RadioBox
    :id="id"
    v-model="value"
    flex="~ row items-center gap-5"
  >
    <RadioBoxItem
      value="true"
      label="Show work as collapsed with a reason why it was hidden"
      h-12
    >
      <span>Show reason</span>
    </RadioBoxItem>
    <RadioBoxItem
      value="false"
      label="Fully hide the work from view"
      h-12
    >
      <span>Hide fully</span>
    </RadioBoxItem>
  </RadioBox>
</template>
