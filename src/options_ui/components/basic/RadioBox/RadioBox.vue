<script setup lang="ts" generic="T extends string">
import type { RadioGroupRootProps } from 'reka-ui'

const props = defineProps<Omit<RadioGroupRootProps, 'modelValue'>>()
const forwarded = useForwardProps(props)

const modelValue = defineModel<T>({ required: true })
</script>

<template>
  <RekaRadioGroupRoot
    v-bind="{ ...forwarded, ...$attrs }"
    :model-value="modelValue"
    @update:model-value="(modelValue = $event as T)"
  >
    <slot />
  </RekaRadioGroupRoot>
</template>
