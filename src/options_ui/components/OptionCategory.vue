<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle: string
}>()

const { id } = useAddNav(props.title)
</script>

<template>
  <fieldset :id="id" card md:px-8>
    <div flex="~ row" pb-2 pt-3>
      <div flex="~ col grow-1">
        <legend text="2xl primary " font="serif 500">
          {{ props.title }}
        </legend>
        <span text="" font="light">
          {{ props.subtitle }}
        </span>
      </div>
      <div text="4xl op80" flex="~ row items-center">
        <slot name="icon" />
      </div>
    </div>
    <div border="b-1" mb-2 />
    <div>
      <slot />
    </div>
  </fieldset>
</template>
