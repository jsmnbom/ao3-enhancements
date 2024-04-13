<script setup lang="ts" generic="T extends HTMLInputElement['type']">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  modelValue?: T extends 'number' ? number : string
  type: T
  unit?: string
}>()

const emits = defineEmits<{
  'update:modelValue': [value: T extends 'number' ? number : string]
}>()

const modelValue = useVModel(props, 'modelValue', emits)

const unitRef = ref<HTMLElement | null>(null)
const { width: unitWidth } = useElementSize(unitRef, undefined, { box: 'border-box' })
</script>

<template>
  <div relative text="sm">
    <input
      v-bind="$attrs"
      v-model="modelValue"
      type="number"
      class="input button-focus-ring"
      border="1 input"
      default box-content h-8 rounded-md
      :style="{
        '--unit-width': `${unitWidth}px`,
        '--model-width': `${String(modelValue).length}ch`,
      }"
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
  </div>
</template>
