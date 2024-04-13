<script setup lang="ts">
import { Toaster as Sonner, type ToasterProps } from 'vue-sonner'
import 'vue-sonner/lib/vue-sonner.css'

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    class="toaster group"
    v-bind="props"
    :toast-options="{
      classes: {
        toast: 'group toast group-[.toaster]:default group-[.toaster]:border-1 group-[.toaster]:shadow-lg',
        description: 'group-[.toast]:text-muted-fg',
        actionButton: 'group-[.toast]:primary',
        cancelButton: 'group-[.toast]:muted',
      },
    }"
  />
</template>
