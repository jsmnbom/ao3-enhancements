<script setup lang="ts">
import type { DropdownMenuTriggerProps } from 'reka-ui'

const props = defineProps<DropdownMenuTriggerProps>()
const forwarded = useForwardProps(props)
</script>

<template>
  <RekaDropdownMenuTrigger v-bind="{ ...forwarded, ...$attrs }" as-child outline-none>
    <slot />
  </RekaDropdownMenuTrigger>
</template>
