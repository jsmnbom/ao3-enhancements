<script setup lang="ts">
import type { SliderRootEmits, SliderRootProps } from 'radix-vue'

const props = defineProps<SliderRootProps>()
const emits = defineEmits<SliderRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RadixSliderRoot
    v-bind="{ ...forwarded, ...$attrs }"
    flex="~ items-center"
    relative w-full touch-none select-none
  >
    <RadixSliderTrack bg="secondary" relative h-2 w-full grow overflow-hidden rounded-full>
      <RadixSliderRange bg="primary" absolute h-full />
    </RadixSliderTrack>
    <RadixSliderThumb
      class="button-focus-ring"
      as-child
      border="2 primary"
      bg="default"
      block h-5 w-5 rounded-full shadow-md
    >
      <div tabindex="-1" />
    </RadixSliderThumb>
  </RadixSliderRoot>
</template>
