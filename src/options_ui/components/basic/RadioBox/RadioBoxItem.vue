<script setup lang="ts">
import type { RadioGroupItemProps } from 'radix-vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<Props>()
interface Props extends RadioGroupItemProps {
  value: string
  label: string
}
const forwarded = useForwardProps(props)
</script>

<template>
  <Tooltip>
    <RadixRadioGroupItem
      v-bind="{ ...forwarded, ...$attrs }"
      :value="value"
      class="button-focus-ring"
      cursor="pointer"
      bg="default aria-checked:primary"
      color="primary aria-checked:primary-fg"
      flex="~ items-center justify-center"
      rounded="lg"
      border="1 aria-checked:primary"
      shadow-sm
    >
      <slot />
    </RadixRadioGroupItem>
    <template #content>
      <span>{{ label }}</span>
    </template>
  </Tooltip>
</template>
