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
      class="group border-1 p-[1px] aria-[checked=true]:(p-[0] border-2! border-primary!) input-ring"

      bg="default"
      color="primary"
      flex="~ items-center justify-center"
      cursor-pointer rounded-md shadow-sm
    >
      <slot />
    </RadixRadioGroupItem>
    <template #content>
      <span>{{ label }}</span>
    </template>
  </Tooltip>
</template>
