<script setup lang="ts">
import type { SwitchRootEmits, SwitchRootProps } from 'radix-vue'

const props = defineProps<SwitchRootProps>()
const emits = defineEmits<SwitchRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RadixSwitchRoot
    v-bind="{ ...forwarded, ...$attrs }"
    class="input-ring"
    bg="state-checked:primary state-unchecked:input"
    border="2 transparent"
    rounded="full"
    cursor="pointer disabled:not-allowed"
    op="disabled:50"
    h-6 w-11 inline-flex items-center shadow-sm transition-colors
  >
    <RadixSwitchThumb
      bg="default"
      translate-x="state-checked:5 state-unchecked:0"
      pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform
    />
  </RadixSwitchRoot>
</template>
