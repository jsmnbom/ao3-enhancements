<script setup lang="ts">
import { type TooltipRootEmits, type TooltipRootProps, useForwardPropsEmits } from 'radix-vue'

const props = defineProps<TooltipRootProps>()
const emits = defineEmits<TooltipRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RadixTooltipRoot v-bind="forwarded">
    <RadixTooltipTrigger>
      <slot />
    </RadixTooltipTrigger>
    <RadixTooltipPortal>
      <RadixTooltipContent
        v-bind="{ ...forwarded, ...$attrs }"
        z-50 overflow-hidden rounded-md px-3.5 py-1 shadow-md
        text="sm popover-foreground"
        bg="popover"
        border="1 solid border"
        class="animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
      >
        <slot name="content" />
      </RadixTooltipContent>
    </RadixTooltipPortal>
  </RadixTooltipRoot>
</template>
