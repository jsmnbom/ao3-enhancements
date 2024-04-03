<script setup lang="ts">
import type { TooltipContentEmits, TooltipContentProps, TooltipRootEmits, TooltipRootProps } from 'radix-vue'

interface Props extends TooltipRootProps, TooltipContentProps {}

const props = withDefaults(defineProps<Props>(), {
  sideOffset: 4,
})
const emits = defineEmits<TooltipRootEmits & TooltipContentEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RadixTooltipRoot v-bind="forwarded" disable-closing-trigger>
    <RadixTooltipTrigger as-child>
      <slot />
    </RadixTooltipTrigger>
    <RadixTooltipPortal>
      <RadixTooltipContent
        v-bind="{ ...forwarded, ...$attrs }"
        class="animate-una-in animate-duration-100ms animate-ease-in popover fade-in-0"
        text="sm"
        border="1"
        font="sans"
        z-100 rounded-sm px-3.5 py-1 shadow-md will-change-opacity will-change-transform
      >
        <div>
          <slot name="content" />
        </div>
      </RadixTooltipContent>
    </RadixTooltipPortal>
  </RadixTooltipRoot>
</template>
