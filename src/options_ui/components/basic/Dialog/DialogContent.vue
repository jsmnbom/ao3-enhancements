<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui'

const props = defineProps<DialogContentProps>()
const emits = defineEmits<DialogContentEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RekaDialogPortal>
    <RekaDialogOverlay
      pos="fixed inset-0 z-50"
      bg="op30 black"
      class="animate-overlay"
    />
    <RekaDialogContent
      v-bind="{ ...forwarded, ...$attrs }"
      pos="fixed left-1/2 top-1/2 z-50"
      translate="x--1/2 y--1/2"
      flex="~ col"
      rounded="sm:lg"
      max-w-lg w-full border p-6
      class="card animate-dialog"
    >
      <slot />

      <RekaDialogClose
        class="input-ring"
        absolute right-4 top-4 rounded-sm
      >
        <Icon i-mdi-close label="Close" />
      </RekaDialogClose>
    </RekaDialogContent>
  </RekaDialogPortal>
</template>
