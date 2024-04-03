<script setup lang="ts">
import { type DropdownMenuItemEmits, type DropdownMenuItemProps } from 'radix-vue'

const props = defineProps<DropdownMenuItemProps>()
const emits = defineEmits<DropdownMenuItemEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RadixDropdownMenuItem
    v-bind="{ ...forwarded, ...$attrs }"
    class="button-focus-ring"
    cursor="pointer data-[disabled]:(default pointer-events-none)"
    op="data-[disabled]:50"
    relative select-none rounded-sm text-sm transition-colors focus:bg-accent focus:text-accent-fg
  >
    <slot />
  </RadixDropdownMenuItem>
</template>
