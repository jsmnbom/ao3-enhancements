<script setup lang="ts">
import type { DropdownMenuContentEmits, DropdownMenuContentProps } from 'radix-vue'

const props = withDefaults(defineProps<DropdownMenuContentProps>(), {
  sideOffset: 4,
})
const emits = defineEmits<DropdownMenuContentEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RadixDropdownMenuPortal>
    <RadixDropdownMenuContent
      v-bind="{ ...forwarded, ...$attrs }"
      class="popover animate-popover"
      border="1"
      z-99 min-w-32 rounded-md shadow-lg
    >
      <slot />
    </RadixDropdownMenuContent>
  </RadixDropdownMenuPortal>
</template>
