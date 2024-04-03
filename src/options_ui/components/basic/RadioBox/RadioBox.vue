<script setup lang="ts">
import type { RadioGroupRootEmits, RadioGroupRootProps } from 'radix-vue'

const props = defineProps<RadioGroupRootProps>()
const emits = defineEmits<RadioGroupRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RadixRadioGroupRoot v-bind="{ ...forwarded, ...$attrs }">
    <slot />
  </RadixRadioGroupRoot>
</template>
