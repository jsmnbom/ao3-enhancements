<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

defineProps<{
  unit?: string
}>()

const modelValue = defineModel<number>()

const unitRef = ref<HTMLElement | null>(null)
const { width: unitWidth } = useElementSize(unitRef, undefined, { box: 'border-box' })
</script>

<template>
  <div relative text-sm>
    <Input
      v-bind="$attrs"
      v-model="modelValue"
      type="number"
      :style="{
        '--unit-width': `${unitWidth}px`,
        '--model-width': `${String(modelValue).length}ch`,
      }"
      box-content h-8 pl-2 text-right
      pr="[var(--unit-width)]"
      w="[var(--model-width)]"
    >
      <template v-if="unit">
        <div
          ref="unitRef"
          pos="absolute inset-y-0 inset-r-0"
          flex="inline items-center"
          pointer-events-none pr-2
        >
          <div h-1lh>
            <span text="0.6rem" op50>
              {{ unit }}
            </span>
          </div>
        </div>
      </template>
    </Input>
  </div>
</template>
