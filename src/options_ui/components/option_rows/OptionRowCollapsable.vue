<script setup lang="ts">
import type { OptionRowProps } from './OptionRow.vue'

const props = defineProps<OptionRowProps>()
const open = defineModel<boolean>('open', { required: true })
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
          animate-collapsible overflow-y-hidden
        >
          <div px="4">
            <slot />
          </div>
        </RadixCollapsibleContent>
      </template>
    </OptionRow>
  </RadixCollapsibleRoot>
</template>
