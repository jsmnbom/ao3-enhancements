<script setup lang="ts">
import type { DialogRootEmits, DialogRootProps } from 'reka-ui'

import { h } from 'vue'

const props = defineProps<DialogRootProps & {
  detachedTrigger?: boolean
}>()
const emits = defineEmits<DialogRootEmits>()

const triggerProps: Record<string, any> = reactive({})
const triggeredBy = ref<HTMLElement | null>(null)

function DialogDetachedTriggerFakeTriggerImpl(props: object) {
  Object.assign(triggerProps, props)
  return h('button', {
    style: {
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
    },
    onFocus: () => triggeredBy.value?.focus(),
    ariaHidden: true,
    tabIndex: -1,
  })
}

const forwarded = useForwardPropsEmits(props, emits)
const forward = computed(() => {
  const { detachedTrigger, ...rest } = forwarded.value
  return rest
})

defineExpose({
  triggerProps,
  triggeredBy,
})
</script>

<template>
  <RekaDialogRoot v-bind="forward">
    <template v-if="detachedTrigger">
      <DialogTrigger as-child>
        <DialogDetachedTriggerFakeTriggerImpl />
      </DialogTrigger>
    </template>
    <slot />
  </RekaDialogRoot>
</template>
