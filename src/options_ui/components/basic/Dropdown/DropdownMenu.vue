<script setup lang="ts">
import type { DropdownMenuRootEmits, DropdownMenuRootProps } from 'reka-ui'

const props = defineProps<DropdownMenuRootProps>()
const emits = defineEmits<DropdownMenuRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RekaDropdownMenuRoot v-bind="{ ...forwarded, ...$attrs }">
    <slot />
  </RekaDropdownMenuRoot>
</template>
