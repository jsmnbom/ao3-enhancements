<script setup lang="ts">
import { useId } from 'radix-vue'

const props = defineProps<{
  title: string
  subtitle: string
}>()

const id = useId()
OptionLabelId.provide(id)
</script>

<template>
  <div grid="~ cols-1 items-center gap-7 sm:cols-2 sm:gap-5" px-5 py-1 min-h="16" border="b-1 solid border">
    <div flex="~ col">
      <RadixLabel
        :for="id"
        inline-block
        font="leading-none 300"
        text="base sm:lg"
      >
        {{ props.title }}
      </RadixLabel>
      <span text="sm" font="300">{{ props.subtitle }}</span>
    </div>
    <div flex="~ col items-center sm:items-end" w-full>
      <slot />
    </div>
  </div>
</template>
