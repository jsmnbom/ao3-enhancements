<script setup lang="ts">
import type { options } from '#common'

const props = defineProps<{
  optionId: options.Id
}>()

const optionValue = useOption(props.optionId) as Ref<boolean>
const id = OptionLabelId.inject()
</script>

<template>
  <RadixSwitchRoot
    :id="id"
    v-model:checked="optionValue"
    bg="state=checked:primary state=unchecked:input"
    h-7 w-13 inline-flex items-center transition-colors button-ring
    border="2 transparent"
    rounded="full"
    cursor="pointer disabled:not-allowed"
    op="disabled:50"
  >
    <RadixSwitchThumb
      pointer-events-none ml0.5 block h-6 w-6 rounded-full shadow-lg ring-0 transition-transform
      bg="background"
      translate-x="state=checked:6 state=unchecked:0"
    />
  </RadixSwitchRoot>
</template>
