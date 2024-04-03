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
</script>

<template>
  <OptionRow
    title="Reading speed"
    subtitle="In words per minute. Used to calculate reading times"
  >
    <template #default="{ id }">
      <div relative>
        <input
          :id="id"
          v-model="inputValue"
          type="number"
          class="button-focus-ring"
          min-w="2ch"
          border="1 input"
          text="sm"
          h-6 rounded-md default py-1 pl-2 pr-8
          :style="{ width: `${inputValue.toString().length + 1}ch` }"
          @blur="update"
          @keydown="update"
        >
        <div
          pos="absolute end-0 inset-y-0 top-0"
          flex="~ items-center"
          pointer-events-none pe-2 pt-1
        >
          <span text="0.6rem" op50>WPM</span>
        </div>
      </div>
    </template>
    <template #extra>
      <RadixSliderRoot
        v-model="sliderValue"
        :min="50"
        :max="1000"
        flex="~ items-center"

        relative w-full touch-none select-none pb-3 pt-1
      >
        <RadixSliderTrack bg="secondary" relative h-2 w-full grow overflow-hidden rounded-full>
          <RadixSliderRange bg="primary" absolute h-full />
        </RadixSliderTrack>
        <RadixSliderThumb
          class="button-focus-ring"
          border="2 primary"
          bg="default"
          transform="hover:scale-110"
          block h-4 w-4 rounded-full transition-transform
        />
      </RadixSliderRoot>
    </template>
  </OptionRow>
</template>
