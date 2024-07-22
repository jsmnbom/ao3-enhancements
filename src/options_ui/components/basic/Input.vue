<script setup lang="ts" generic="T extends InputTypeHTMLAttribute">
import type { InputTypeHTMLAttribute } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  type: T
}>()

const modelValue = defineModel<T extends 'number' ? number : string>()
</script>

<template>
  <div relative border="1 input" rounded-md>
    <input
      v-bind="$attrs"
      v-model="modelValue"
      :type="props.type"
      class="default input-ring"
      rounded-md
    >
    <slot />
  </div>
</template>
