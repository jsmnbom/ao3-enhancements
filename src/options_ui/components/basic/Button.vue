<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'

interface Props extends PrimitiveProps {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  variant: 'default',
  size: 'default',
})

const variants = {
  default: 'bg-primary text-primary-fg hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-fg hover:bg-destructive/90',
  outline: 'border-1 border-input bg-default text-default-fg hover:bg-input',
  secondary: 'bg-secondary text-secondary-fg hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-fg',
  link: 'text-primary underline-offset-4 hover:underline',
} as const

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8',
  icon: 'h-10 w-10',
} as const
</script>

<template>
  <RekaPrimitive
    :as="as"
    :as-child="asChild"
    :class="[variants[props.variant], (props.variant !== 'link' ? sizes[props.size] : [])]"
    class="btn"
    ws-nowrap text-sm
  >
    <slot />
  </RekaPrimitive>
</template>
