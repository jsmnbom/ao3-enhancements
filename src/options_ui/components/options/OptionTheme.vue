<script setup lang="ts">
import { ref } from 'vue'

import OptionThemeItem from './OptionThemeItem.vue'

const props = defineProps<{
  id: string
}>()

const state = ref<'ao3' | 'light' | 'dark'>('ao3')
</script>

<template>
  <RadioGroupRoot
    :id="id"
    v-model="state"
    flex="~ row items-center gap-5"
  >
    <OptionThemeItem
      value="ao3"
    >
      <span>ao3</span>
    </OptionThemeItem>
    <OptionThemeItem
      value="light"
    >
      <icon-mdi-lightbulb-on aria-hidden="true" />
    </OptionThemeItem>
    <OptionThemeItem
      value="dark"
    >
      <icon-mdi-moon-waning-crescent aria-hidden="true" />
    </OptionThemeItem>
  </RadioGroupRoot>
</template>
