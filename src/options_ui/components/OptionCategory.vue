<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle: string
}>()

const { id } = useAddNav(props.title)
</script>

<template>
  <section :id="id" card px-2 sm:px-8>
    <div flex="~ row" pb-2 pt-3>
      <div flex="~ col grow-1">
        <h1 text="2xl primary " font="serif 500">
          {{ props.title }}
        </h1>
        <span text="" font="light" max-w="sm:80%">
          {{ props.subtitle }}
        </span>
      </div>
      <div text="4xl op80" flex="~ row items-end" pl-6>
        <slot name="icon" />
      </div>
    </div>
    <div border="b-1" />
    <div>
      <slot />
    </div>
  </section>
</template>
