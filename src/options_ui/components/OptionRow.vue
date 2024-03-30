<script setup lang="ts">
import { useId } from 'radix-vue'

const props = defineProps<{
  title: string
  subtitle: string
}>()

const id = useId()
</script>

<template>
  <div grid="~ cols-1 items-center gap-7 md:cols-2 md:gap-5" px-5 py-3 border="b-1 solid border">
    <div flex="~ col">
      <Label
        :for="id"
        inline-block
        font="leading-none 300"
        text="base sm:lg"
      >{{ props.title }}</Label>
      <span text="sm" font="300">{{ props.subtitle }}</span>
    </div>
    <div flex="justify-self-end">
      <slot :id="id" />
    </div>
  </div>
</template>
