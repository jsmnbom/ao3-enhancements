<!-- eslint-disable vue/one-component-per-file -->
<script lang="ts">
import { DialogRoot, DialogTrigger, Primitive } from 'radix-vue'
import { h } from 'vue'

const Dialog = defineComponent({
  props: DialogRoot.props as any,
  setup(props, { slots, expose, attrs }) {
    const forwarded = useForwardProps(props)

    const triggerProps = ref<Record<string, any>>({})
    const lastTrigger = ref<HTMLElement | null>(null)

    const FakeTrigger = defineComponent({
      inheritAttrs: false,
      setup(_, { attrs }) {
        watch(() => attrs, () => triggerProps.value = attrs, { immediate: true })
        return () => h('button', { onFocus: () => lastTrigger.value?.focus(), ariaHidden: true, tabIndex: -1 })
      },
    })

    const trigger = defineComponent({
      props: DialogTrigger.props as any,
      setup(props, { attrs, slots }) {
        const { forwardRef, currentElement } = useForwardExpose()

        return () => h(Primitive, {
          ...props,
          ...attrs,
          ...triggerProps.value,
          ref: forwardRef,
          onClick: () => {
            lastTrigger.value = currentElement.value
            props.onClick?.()
            ;(attrs as any).onClick?.()
            triggerProps.value.onClick?.()
          },
        }, slots)
      },
    })
    expose({ trigger })

    return () => h(DialogRoot, { ...forwarded.value, ...attrs }, {
      default: () => [
        h(DialogTrigger, { asChild: true }, {
          default: () => h(FakeTrigger),
        }),
        slots.default?.(),

      ],
    })
  },
}) as unknown as typeof DialogRoot

export default Dialog
</script>
