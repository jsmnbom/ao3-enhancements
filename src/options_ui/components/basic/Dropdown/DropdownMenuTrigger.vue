<script setup lang="ts">
import type { DropdownMenuTriggerProps } from 'radix-vue'

const props = defineProps<DropdownMenuTriggerProps>()
const forwarded = useForwardProps(props)
</script>

<template>
  <RadixDropdownMenuTrigger v-bind="{ ...forwarded, ...$attrs }" as-child outline-none>
    <slot />
  </RadixDropdownMenuTrigger>
</template>
