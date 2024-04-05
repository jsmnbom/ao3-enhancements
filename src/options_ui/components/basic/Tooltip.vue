<script setup lang="ts">
import type { TooltipRootEmits, TooltipRootProps } from 'radix-vue'

const props = defineProps<TooltipRootProps>()
const emits = defineEmits<TooltipRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RadixTooltipRoot v-bind="forwarded" disable-closing-trigger>
    <RadixTooltipTrigger as-child>
      <slot />
    </RadixTooltipTrigger>
    <RadixTooltipPortal>
      <RadixTooltipContent
        v-bind="$attrs"
        :side-offset="4"
        class="popover"
        text="sm"
        border="1"
        font="sans"
        z-100 animate-tooltip rounded-sm px-3.5 py-1 shadow-md
      >
        <div>
          <slot name="content" />
        </div>
      </RadixTooltipContent>
    </RadixTooltipPortal>
  </RadixTooltipRoot>
</template>
