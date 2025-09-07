<script setup lang="ts">
import type { SelectRootEmits, SelectRootProps } from 'reka-ui'

const props = defineProps<SelectRootProps>()
const emits = defineEmits<SelectRootEmits>()

const forward = useForwardPropsEmits(props, emits)
</script>

<template>
  <RekaSelectRoot v-bind="forward">
    <RekaSelectTrigger
      class="disabled:cursor-not-allowed default [&>span]:line-clamp-1 placeholder:text-muted-fg disabled:op50 input-ring"
      flex="~ items-center justify-between"
      border="1 input"
      h-8 w-full rounded-md px-3 py-2 text-sm
    >
      <RekaSelectValue />
      <RekaSelectIcon as-child>
        <Icon i-mdi-chevron-down op50 text="4" />
      </RekaSelectIcon>
    </RekaSelectTrigger>

    <RekaSelectPortal>
      <RekaSelectContent position="popper" relative z-50 max-h-96 min-w-32 overflow-hidden border rounded-md shadow-md class="popover">
        <RekaSelectScrollUpButton>
          <Icon i-mdi-chevron-up />
        </RekaSelectScrollUpButton>
        <RekaSelectViewport class="h-[--radix-select-trigger-height] min-w-[--radix-select-trigger-width] w-full">
          <slot />
        </RekaSelectViewport>
        <RekaSelectScrollDownButton>
          <Icon i-mdi-chevron-down />
        </RekaSelectScrollDownButton>
      </RekaSelectContent>
    </RekaSelectPortal>
  </RekaSelectRoot>
</template>
