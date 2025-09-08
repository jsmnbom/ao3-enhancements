<script setup lang="ts">
import type { OptionRowProps } from './OptionRow.vue'

const props = defineProps<OptionRowProps>()
const open = defineModel<boolean>('open', { required: true })
const forwarded = useForwardProps(props)
</script>

<template>
  <RekaCollapsibleRoot :open="open">
    <OptionRow v-bind="forwarded">
      <template #default="{ id }">
        <RekaCollapsibleTrigger as-child>
          <Switch :id="id" v-model="open" />
        </RekaCollapsibleTrigger>
      </template>
      <template #extra>
        <RekaCollapsibleContent
          mx="-4"
          animate-collapsible overflow-y-hidden
        >
          <div px="4">
            <slot />
          </div>
        </RekaCollapsibleContent>
      </template>
    </OptionRow>
  </RekaCollapsibleRoot>
</template>
