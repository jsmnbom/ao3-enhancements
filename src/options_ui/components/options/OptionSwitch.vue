<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  id: string
}>()

const switchState = ref(false)
</script>

<template>
  <SwitchRoot
    :id="id"
    v-model:checked="switchState"
    bg="state=checked:primary state=unchecked:input"
    h-7 w-13 inline-flex items-center transition-colors input-ring
    border="2 transparent"
    rounded="full"
    cursor="pointer disabled:not-allowed"
    op="disabled:50"
  >
    <SwitchThumb
      pointer-events-none block h-6 w-6 rounded-full shadow-lg ring-0 transition-transform
      bg="background"
      translate-x="state=checked:6 state=unchecked:0"
    />
  </SwitchRoot>
</template>
