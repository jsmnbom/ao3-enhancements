<script setup lang="ts">
import type { PrimitiveProps } from 'radix-vue'

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
  outline: 'border-1 border-input bg-default hover:bg-accent hover:text-accent-fg',
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
  <RadixPrimitive
    :as="as"
    :as-child="asChild"
    :class="[variants[props.variant], sizes[props.size]]"
    class="button-focus-ring"
    flex="inline items-center justify-center"
    text="sm"
    whitespace-nowrap rounded-md
  >
    <slot />
  </RadixPrimitive>
</template>
