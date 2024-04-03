<script setup lang="ts">
import { useId } from 'radix-vue'

const props = defineProps<{
  title: string
  subtitle: string
  small?: boolean
}>()

const id = useId()
OptionLabelId.provide(id)
</script>

<template>
  <div py-1 min-h="16" flex="~ col justify-center">
    <label min-h="12" :for="id" grid="~ cols-[1fr_min-content] items-center">
      <div flex="~ col">
        <span font="leading-none 400" text="base">{{ props.title }}</span>
        <span text="sm muted-fg">{{ props.subtitle }}</span>
      </div>
      <div flex="~ col justify-center items-center" h-full w-full>
        <slot :id="id" />
      </div>
    </label>
    <slot :id="id" name="extra" />
  </div>
</template>
