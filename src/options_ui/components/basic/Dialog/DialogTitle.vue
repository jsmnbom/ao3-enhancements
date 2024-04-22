<script setup lang="ts">
import type { DialogTitleProps } from 'radix-vue'

const props = defineProps<DialogTitleProps>()
const forwardedProps = useForwardProps(props)
</script>

<template>
  <RadixDialogTitle
    v-bind="{ ...forwardedProps, ...$attrs }"
    as="h1"
    m="x--6 t--6"
    p="y-4 x-6"
    text="primary"
    font="serif 500"
    border-b text-lg
  >
    <slot />
  </RadixDialogTitle>
</template>
