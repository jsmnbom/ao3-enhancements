<script setup lang="ts">
defineProps<{
  value: string
  label: string
}>()
</script>

<template>
  <Tooltip>
    <RadixRadioGroupItem
      :value="value"
      h-12 w-12 outline-none button-ring
      bg="transparent state=checked:primary"
      color="primary state=checked:primary-foreground"
      flex="~ items-center justify-center"
      rounded="lg"
      border="solid 1 border"
      class=""
    >
      <slot />
    </RadixRadioGroupItem>
    <template #content>
      <span>{{ label }}</span>
    </template>
  </Tooltip>
</template>
