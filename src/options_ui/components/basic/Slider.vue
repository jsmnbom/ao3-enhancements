<script setup lang="ts">
import type { SliderRootEmits, SliderRootProps } from 'reka-ui'

const props = defineProps<SliderRootProps>()
const emits = defineEmits<SliderRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RekaSliderRoot
    v-bind="{ ...forwarded, ...$attrs }"
    flex="~ items-center"
    relative w-full touch-none select-none
  >
    <RekaSliderTrack bg="input" relative h-2 w-full grow overflow-hidden rounded-full>
      <RekaSliderRange bg="primary" absolute h-full />
    </RekaSliderTrack>
    <RekaSliderThumb
      class="input-ring"
      as-child
      border="2 primary"
      bg="default"
      block h-5 w-5 rounded-full shadow-md
    >
      <div tabindex="-1" />
    </RekaSliderThumb>
  </RekaSliderRoot>
</template>
