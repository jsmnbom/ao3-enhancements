<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'radix-vue'

const props = defineProps<DialogContentProps>()
const emits = defineEmits<DialogContentEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RadixDialogPortal>
    <RadixDialogOverlay
      pos="fixed inset-0 z-50"
      bg="op30 black"
      class="animate-overlay"
    />
    <RadixDialogContent
      v-bind="{ ...forwarded, ...$attrs }"
      pos="fixed left-1/2 top-1/2 z-50"
      translate="x--1/2 y--1/2"
      flex="~ col"
      rounded="sm:lg"
      max-w-lg w-full border p-6
      class="card animate-dialog"
    >
      <slot />

      <RadixDialogClose
        class="button-focus-ring"
        absolute right-4 top-4 rounded-sm
      >
        <Icon i-mdi-close label="Close" />
      </RadixDialogClose>
    </RadixDialogContent>
  </RadixDialogPortal>
</template>
