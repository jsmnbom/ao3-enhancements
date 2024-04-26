<script setup lang="ts">
import type { SelectRootEmits, SelectRootProps } from 'radix-vue'

const props = defineProps<SelectRootProps>()
const emits = defineEmits<SelectRootEmits>()

const forward = useForwardPropsEmits(props, emits)
</script>

<template>
  <RadixSelectRoot v-bind="forward">
    <RadixSelectTrigger
      class="disabled:cursor-not-allowedd default [&>span]:line-clamp-1 placeholder:text-muted-fg disabled:(op50) button-focus-ring"
      flex="~ items-center justify-between"
      border="1 input"
      h-8 w-full rounded-md px-3 py-2 text-sm
    >
      <RadixSelectValue />
      <RadixSelectIcon as-child>
        <Icon i-mdi-chevron-down op50 text="4" />
      </RadixSelectIcon>
    </RadixSelectTrigger>

    <RadixSelectPortal>
      <RadixSelectContent position="popper" relative z-50 max-h-96 min-w-32 overflow-hidden border rounded-md shadow-md class="popover">
        <RadixSelectScrollUpButton>
          <Icon i-mdi-chevron-up />
        </RadixSelectScrollUpButton>
        <RadixSelectViewport class="h-[--radix-select-trigger-height] min-w-[--radix-select-trigger-width] w-full">
          <slot />
        </RadixSelectViewport>
        <RadixSelectScrollDownButton>
          <Icon i-mdi-chevron-down />
        </RadixSelectScrollDownButton>
      </RadixSelectContent>
    </RadixSelectPortal>
  </RadixSelectRoot>
</template>
