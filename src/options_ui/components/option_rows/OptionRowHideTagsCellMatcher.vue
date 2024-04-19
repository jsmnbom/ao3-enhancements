<script setup lang="ts">
import type { CellContext } from '@tanstack/vue-table'

import type { TagFilter } from '#common'

const props = defineProps<{
  context: CellContext<TagFilter, TagFilter['matcher']>
}>()

const [DefineItem, Item] = createReusableTemplate<{ value: TagFilter['matcher'] }>()

const test = ref<TagFilter['matcher']>('exact')

console.log(props.context.getValue(), props.context)
</script>

<template>
  <DefineItem v-slot="{ $slots, value }">
    <RadixToggleGroupItem
      :value="value"
      pos="relative"
      z-10
      h-6 w-6
      flex="~ items-center justify-center"
      bg="hover:state-off:input default state-on:primary op40!"
      text="base default-fg"
      font="leading-4"
      rounded
      cursor="pointer"
      border="1 transparent state-on:primary"
      class="button-focus-ring"
    >
      <component :is="$slots.default" />
    </RadixToggleGroupItem>
  </DefineItem>

  <RadixToggleGroupRoot
    v-model="test"
    type="single"
    flex="~ column"
    w="min"
  >
    <Item value="exact">
      <IconCodiconSurroundWith h-4 w-4 />
    </Item>
    <Item value="contains">
      <IconCodiconWholeWord h-4 w-4 />
    </Item>
    <Item value="regex">
      <IconCodiconRegex h-4 w-4 />
    </Item>
  </RadixToggleGroupRoot>
</template>
