<script setup lang="ts">
import type { SelectItemProps } from 'radix-vue'

const props = defineProps<SelectItemProps>()
</script>

<template>
  <RadixSelectItem
    v-bind="props"
    flex="~ items-center"
    bg="focus:input"
    text="sm"
    relative w-full cursor-default select-none py-1.5 pl-8 pr-2 outline-none
    class="data-[disabled]:pointer-events-none data-[disabled]:op-50"
  >
    <RadixSelectItemText>
      <slot />
    </RadixSelectItemText>
    <span class="absolute left-2 h-3.5 w-3.5 flex items-center justify-center">
      <RadixSelectItemIndicator>
        <Icon i-mdi-check />
      </RadixSelectItemIndicator>
    </span>
  </RadixSelectItem>
</template>
