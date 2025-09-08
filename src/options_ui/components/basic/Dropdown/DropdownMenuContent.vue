<script setup lang="ts">
import type { DropdownMenuContentEmits, DropdownMenuContentProps } from 'reka-ui'

const props = withDefaults(defineProps<DropdownMenuContentProps>(), {
  sideOffset: 4,
})
const emits = defineEmits<DropdownMenuContentEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RekaDropdownMenuPortal>
    <RekaDropdownMenuContent
      v-bind="{ ...forwarded, ...$attrs }"
      class="animate-popover popover"
      border="1"
      z-99 min-w-32 rounded-md shadow-lg
    >
      <slot />
    </RekaDropdownMenuContent>
  </RekaDropdownMenuPortal>
</template>
