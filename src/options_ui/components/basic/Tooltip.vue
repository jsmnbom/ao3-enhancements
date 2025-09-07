<script setup lang="ts">
import type { TooltipRootEmits, TooltipRootProps } from 'reka-ui'

interface Props extends TooltipRootProps {
  content?: string
  width?: number
}

const props = defineProps<Props>()
const emits = defineEmits<TooltipRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RekaTooltipRoot v-bind="forwarded" disable-closing-trigger>
    <RekaTooltipTrigger as-child>
      <slot />
    </RekaTooltipTrigger>
    <RekaTooltipPortal>
      <RekaTooltipContent
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
      </RekaTooltipContent>
    </RekaTooltipPortal>
  </RekaTooltipRoot>
</template>
