<script setup lang="ts">
defineProps<{
  id: string
  label: string
}>()
</script>

<template>
  <ArchiveLink :user-path="`/preferences#preference_${id}`">
    <span font="stretch-condensed" text="nowrap"><slot>{{ label }}</slot></span>
  </ArchiveLink>
</template>
