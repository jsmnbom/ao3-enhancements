<script setup lang="ts">
import type { SwitchRootEmits, SwitchRootProps } from 'radix-vue'

const props = defineProps<SwitchRootProps>()
const emits = defineEmits<SwitchRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RadixSwitchRoot
    v-bind="{ ...forwarded, ...$attrs }"
    class="button-focus-ring"
    bg="state-checked:primary state-unchecked:input"
    border="2 transparent"
    rounded="full"
    cursor="pointer disabled:not-allowed"
    op="disabled:50"
    h-7 w-13 inline-flex items-center shadow-sm transition-colors
  >
    <RadixSwitchThumb
      bg="default"
      translate-x="state-checked:6 state-unchecked:0"
      pointer-events-none block h-6 w-6 rounded-full shadow-lg ring-0 transition-transform
    />
  </RadixSwitchRoot>
</template>
