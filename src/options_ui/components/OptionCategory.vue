<script setup lang="ts">
import { useAddNav } from '../composables/useNav.js'

const props = defineProps<{
  title: string
  subtitle: string
}>()

useAddNav(props.title)
</script>

<template>
  <div bg="white" shadow="lg">
    <div border="b-1 solid black opacity-10" flex="~ row" px-4 pb-2 pt-3>
      <div flex="~ col grow-1">
        <span text="lg">{{ props.title }}</span>
        <span text="sm" font="light">
          {{ props.subtitle }}
        </span>
      </div>
      <div text="4xl black opacity-80" flex="~ row items-center">
        <slot name="icon" />
      </div>
    </div>
    <slot />
  </div>
</template>
