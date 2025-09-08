<script setup lang="ts">
import type { options } from '#common'

const props = defineProps<{
  optionId: options.BooleanId
}>()

const optionValue = useOption(props.optionId)
const id = OptionLabelId.inject()
</script>

<template>
  <Switch
    :id="id"
    v-model="optionValue"
  />
</template>
