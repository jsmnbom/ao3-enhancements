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
    p="t-4 x-6 b-2"
    text="primary"
    font="serif 500"
    text-lg
  >
    <slot />
  </RadixDialogTitle>
</template>
