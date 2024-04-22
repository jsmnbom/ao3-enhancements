<script setup lang="ts">
import type { TooltipRootEmits, TooltipRootProps } from 'radix-vue'

interface Props extends TooltipRootProps {
  content?: string
  width?: number
}

const props = defineProps<Props>()
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
        class="animate-tooltip popover"
        text="sm"
        border="1"
        z-100 rounded-sm px-2 py-1 shadow-md
        :style="{ maxWidth: `${(props.width ?? 60) / 4}rem` }"
      >
        <div>
          <slot name="content">
            <span>{{ props.content }}</span>
          </slot>
        </div>
      </RadixTooltipContent>
    </RadixTooltipPortal>
  </RadixTooltipRoot>
</template>
