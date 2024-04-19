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
          mx="-4"
          overflow-y-hidden
          animate-collapsible
        >
          <div px="4">
            <slot />
          </div>
        </RadixCollapsibleContent>
      </template>
    </OptionRow>
  </RadixCollapsibleRoot>
</template>
