<script setup lang="ts">
import type { OptionRowProps } from './OptionRow.vue'

const props = defineProps<OptionRowProps>()
const open = defineModel<boolean>('open')
const forwarded = useForwardProps(props)
</script>

<template>
  <RadixCollapsibleRoot :open="open">
    <OptionRow v-bind="forwarded">
      <template #default="{ id }">
        <RadixCollapsibleTrigger as-child>
          <Switch :id="id" v-model:checked="open" />
        </RadixCollapsibleTrigger>
      </template>
      <template #extra>
        <RadixCollapsibleContent
          overflow-hidden animate-collapsible
        >
          <slot />
        </RadixCollapsibleContent>
      </template>
    </OptionRow>
  </RadixCollapsibleRoot>
</template>
