<script setup lang="ts">
import type { DropdownMenuRootEmits, DropdownMenuRootProps } from 'radix-vue'

const props = defineProps<DropdownMenuRootProps>()
const emits = defineEmits<DropdownMenuRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RadixDropdownMenuRoot v-bind="{ ...forwarded, ...$attrs }">
    <slot />
  </RadixDropdownMenuRoot>
</template>
