<script setup lang="ts">
import { debounce } from '@antfu/utils'

const { enabled, maxFandoms: optionValue } = useOption('hideCrossovers')

const inputValue = ref(optionValue.value)

watch(optionValue, () => inputValue.value = optionValue.value)

const [min, max] = [1, 10]

const update = debounce(100, () => {
  optionValue.value = Math.min(Math.max(inputValue.value, min), max)
})
</script>

<template>
  <OptionRowCollapsable
    v-model:open="enabled"
    title="Crossovers"
    subtitle="Hide works with many fandoms (often crossovers or collections)"
  >
    <label for="hideWorks-crossovers" py-1 flex="~ row items-center gap-1">
      <span font="leading-none" text="sm muted-fg">Hide when work has more than</span>
      <div flex="~ row justify-center items-center gap-0.5">
        <button
          class="btn"
          text="5 primary"
          z-10 h-6 w-5
          @click="inputValue--;update()"
        >
          <Icon i-mdi-minus label="Decrease" />
        </button>
        <NumberInput
          id="hideWorks-crossovers"
          v-bind="$attrs"
          v-model="inputValue"
          unit="&nbsp;fandoms"
          @blur="update"
          @keydown="update"
        />
        <button
          class="btn"
          text="5 primary"
          z-10 h-6 w-5
          @click="inputValue++;update()"
        >
          <Icon i-mdi-plus label="Increase" />
        </button>
      </div>
    </label>
  </OptionRowCollapsable>
</template>
