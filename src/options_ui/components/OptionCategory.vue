<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle: string
}>()

const { id } = useAddNav(props.title)
</script>

<template>
  <fieldset
    :id="id" bg="card-background" text="card-foreground" shadow="lg"
  >
    <div border="b-1 solid border" flex="~ row" px-4 pb-2 pt-3>
      <div flex="~ col grow-1">
        <legend text="lg">
          {{ props.title }}
        </legend>
        <span text="sm" font="light">
          {{ props.subtitle }}
        </span>
      </div>
      <div text="4xl op80" flex="~ row items-center">
        <slot name="icon" />
      </div>
    </div>
    <slot />
  </fieldset>
</template>
