<script setup lang="ts">
import type { RadioGroupRootEmits, RadioGroupRootProps } from 'reka-ui'

const props = defineProps<RadioGroupRootProps>()
const emits = defineEmits<RadioGroupRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RekaRadioGroupRoot v-bind="{ ...forwarded, ...$attrs }">
    <slot />
  </RekaRadioGroupRoot>
</template>
