<script setup lang="ts">
import { debounce } from '@antfu/utils'

const optionValue = useOption('wordsPerMinute')
const inputValue = ref(optionValue.value)

watch(optionValue, () => inputValue.value = optionValue.value)

const update = debounce(100, () => {
  optionValue.value = inputValue.value
})

const sliderValue = computed({
  get: () => [Number(inputValue.value) || 0],
  set: (v) => {
    inputValue.value = v[0]
    update()
  },
})

const id = OptionLabelId.inject()
</script>

<template>
  <div
    flex="~ col items-end gap-4"
    w-full pb-4 pt-2
  >
    <div relative>
      <input
        :id="id"
        v-model="inputValue"
        type="number"
        h-6 py-1 pl-2 pr-8 button-ring min-w="2ch"
        border="solid 1 input"
        rounded="md"
        bg="background"
        text="sm"
        :style="{ width: `${inputValue.toString().length + 1}ch` }"
        @blur="update"
        @keydown="update"
      >
      <div class="pointer-events-none absolute end-0 inset-y-0 top-0 flex items-center pe-2 pt-1">
        <span text="0.6rem" op50>WPM</span>
      </div>
    </div>
    <RadixSliderRoot
      v-model="sliderValue"
      :min="50"
      :max="1000"
      class="relative w-full flex touch-none select-none items-center"
    >
      <RadixSliderTrack class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <RadixSliderRange class="absolute h-full bg-primary" />
      </RadixSliderTrack>
      <RadixSliderThumb
        border="2 solid primary"
        bg="background"
        block h-5 w-5 rounded-full transition-colors button-ring
      />
    </RadixSliderRoot>
  </div>
</template>
