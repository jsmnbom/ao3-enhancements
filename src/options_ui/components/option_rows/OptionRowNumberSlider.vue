<script setup lang="ts">
import { debounce } from '@antfu/utils'

import type { options } from '#common'

import type { OptionRowProps } from './OptionRow.vue'

const {
  title,
  subtitle,
  optionEnabledId,
  optionId,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  sliderMin,
  sliderMax,
  sliderStep = 1,
} = defineProps<OptionRowProps & {
  optionEnabledId?: options.BooleanId
  optionId: options.NumberId
  unit?: string
  min?: number
  max?: number
  sliderMin?: number
  sliderMax?: number
  sliderStep?: number
}>()

const optionEnabledValue = optionEnabledId ? useOption(optionEnabledId) : undefined
const optionValue = useOption(optionId)

const inputValue = ref(optionValue.value)

watch(optionValue, () => inputValue.value = optionValue.value)

const update = debounce(100, () => {
  optionValue.value = Math.min(Math.max(inputValue.value, min), max)
})

const sliderValue = computed({
  get: () => [Number(inputValue.value) || min],
  set: (v) => {
    inputValue.value = v[0]
    update()
  },
})

watch(optionValue, () => {
  if (optionEnabledValue)
    optionEnabledValue.value = optionValue.value > 0
})
</script>

<template>
  <OptionRow
    :title="title"
    :subtitle="subtitle"
  >
    <template #default="{ id }">
      <Input
        v-bind="$attrs"
        :id="id"
        v-model="inputValue"
        type="number"
        pl-2 text-right
        pr="[var(--unit-width)]"
        w="[var(--model-width)]"
        :unit="unit"
        @blur="update"
        @keydown="update"
      />
    </template>
    <template #extra>
      <Slider
        v-model="sliderValue"
        aria-hidden="true"
        :min="sliderMin ?? min"
        :max="sliderMax ?? max"
        :step="sliderStep"
        pb-3 pt-1
      />
    </template>
  </OptionRow>
</template>
