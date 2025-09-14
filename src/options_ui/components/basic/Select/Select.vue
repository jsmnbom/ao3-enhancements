<script setup lang="ts" generic="T extends string | number | null">
import type { SelectRootEmits, SelectRootProps } from 'reka-ui'

const props = defineProps<SelectRootProps<T> & {
  id?: string
}>()
const emits = defineEmits<SelectRootEmits<T>>()
const delegatedProps = reactiveOmit(props, 'id')
const forward = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <RekaSelectRoot v-bind="forward">
    <RekaSelectTrigger
      :id="props.id"
      class="whitespace-nowrap default input-ring disabled:cursor-not-allowed placeholder:text-muted-fg disabled:op50"
      flex="~ items-center justify-between"
      border="1 input"
      rounded-md px-3 py-2 text-sm
      v-bind="$attrs"
    >
      <RekaSelectValue v-slot="{ modelValue, selectedLabel }">
        <span
          :class="{ 'text-muted-fg': !modelValue }"
        >{{ selectedLabel[0] }}</span>
      </RekaSelectValue>
      <RekaSelectIcon as-child>
        <Icon i-mdi-chevron-down op50 text="4" />
      </RekaSelectIcon>
    </RekaSelectTrigger>

    <RekaSelectPortal>
      <RekaSelectContent position="popper" relative z-50 max-h-96 min-w-32 overflow-hidden border rounded-md shadow-md class="popover">
        <RekaSelectScrollUpButton>
          <Icon i-mdi-chevron-up />
        </RekaSelectScrollUpButton>
        <RekaSelectViewport class="h-[--reka-select-trigger-height] min-w-[--reka-select-trigger-width] w-full">
          <slot />
        </RekaSelectViewport>
        <RekaSelectScrollDownButton>
          <Icon i-mdi-chevron-down />
        </RekaSelectScrollDownButton>
      </RekaSelectContent>
    </RekaSelectPortal>
  </RekaSelectRoot>
</template>
