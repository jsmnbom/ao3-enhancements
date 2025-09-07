<script setup lang="ts">
import type { DialogTitleProps } from 'reka-ui'

const props = defineProps<DialogTitleProps>()
const forwardedProps = useForwardProps(props)
</script>

<template>
  <RekaDialogTitle
    v-bind="{ ...forwardedProps, ...$attrs }"
    as="h1"
    m="x--6 t--6"
    p="t-4 x-6 b-2"
    text="primary"
    font="serif 500"
    text-lg
  >
    <slot />
  </RekaDialogTitle>
</template>
