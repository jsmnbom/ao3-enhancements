<script setup lang="ts">
import type { RadioGroupItemProps } from 'reka-ui'

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
    <RekaRadioGroupItem
      v-bind="{ ...forwarded, ...$attrs }"
      :value="value"
      class="group border-1 p-[1px] aria-[checked=true]:p-[0] aria-[checked=true]:border-2! aria-[checked=true]:border-primary! input-ring"
      bg="default"
      color="primary"
      flex="~ items-center justify-center"
      cursor-pointer rounded-md shadow-sm
    >
      <slot />
    </RekaRadioGroupItem>
    <template #content>
      <span>{{ label }}</span>
    </template>
  </Tooltip>
</template>
