<script setup lang="ts">
const props = defineProps< {
  dialog: ComponentInstance['Dialog']
}>()

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

const attrs = useAttrs()

const root = ref<HTMLElement | null>(null)

const triggerProps = computed(() => {
  const { onClick: _, ...rest } = props.dialog.triggerProps
  return { ...attrs, ...rest }
})

function onClick(e: MouseEvent) {
  emit('click', e)
  const dialog = props.dialog
  dialog.triggeredBy = root.value!
  dialog.triggerProps.onClick?.(e)
}
</script>

<template>
  <button v-bind="triggerProps" ref="root" @click="onClick">
    <slot />
  </button>
</template>
