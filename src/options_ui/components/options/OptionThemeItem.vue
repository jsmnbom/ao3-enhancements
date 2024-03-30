<script setup lang="ts">
defineProps<{
  value: string
}>()
</script>

<template>
  <RadioGroupItem
    :value="value"
    h-12 w-12
    outline-none
    bg="transparent state=checked:primary"
    color="primary state=checked:primary-foreground"
    flex="~ items-center justify-center"
    rounded="lg"
    input-ring
    border="solid 1 border"
    class=""
  >
    <slot />
  </RadioGroupItem>
</template>
