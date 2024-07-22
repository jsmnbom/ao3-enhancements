<script setup lang="ts">
import { getArchiveLink } from '#common'

const props = defineProps<{
  userPath?: string
  path?: string
}>()

const { userId } = useOption('user')

const href = computed(() => {
  if (props.userPath)
    return userId?.value ? getArchiveLink(`/users/${userId.value}${props.userPath}`) : undefined
  if (props.path)
    return getArchiveLink(props.path)
  return undefined
})
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :class="{ link: !!href }"
  >
    <slot />
  </a>
</template>
