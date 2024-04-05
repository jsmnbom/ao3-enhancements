<script setup lang="ts">
import type { options } from '#common'

import type { OptionRowProps } from './OptionRow.vue'

const props = defineProps<OptionRowProps & {
  switchOptionId: options.Id
}>()

const switchOptionValue = useOption(props.switchOptionId) as Ref<boolean>

const forwarded = useForwardProps(props)
</script>

<template>
  <RadixCollapsibleRoot :open="switchOptionValue">
    <OptionRow v-bind="forwarded">
      <template #default="{ id }">
        <RadixCollapsibleTrigger as-child>
          <Switch :id="id" v-model:checked="switchOptionValue" />
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
