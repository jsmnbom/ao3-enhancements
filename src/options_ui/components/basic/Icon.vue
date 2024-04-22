<script lang="ts">
import { Fragment, h } from 'vue'
import type { AllowedComponentProps, ComponentCustomProps, SetupContext, VNodeProps } from 'vue'

export default function Icon(
  props: { [K in `i-${string}`]: string } & { label?: string } & VNodeProps & AllowedComponentProps & ComponentCustomProps,
  ctx: SetupContext,
) {
  return h(Fragment, [
    h('span', { ...props, ...ctx.attrs, 'aria-hidden': true }),
    props.label && h('span', { 'sr-only': '' }, props.label),
  ])
}
</script>
