<script setup lang="ts">
import { useId } from 'radix-vue'

export interface OptionRowProps {
  title: string
  subtitle: string
}

const props = defineProps<OptionRowProps>()

const id = useId()
OptionLabelId.provide(id)
</script>

<template>
  <div flex="~ col justify-center" pb-2 pt-2>
    <label min-h="10" :for="id" grid="~ cols-[1fr_min-content] items-center">
      <div flex="~ col" mr-4>
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
