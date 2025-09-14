<script setup lang="ts">
const optionValue = useOption('forceAlignment')
const id = OptionLabelId.inject()
</script>

<template>
  <Select
    :id="id"
    v-model="optionValue"
    h-8 w-40
  >
    <SelectItem :value="null">
      <span text="muted-fg">Disabled</span>
    </SelectItem>
    <SelectItem value="start">
      Left aligned
    </SelectItem>
    <SelectItem value="end">
      Right aligned
    </SelectItem>
    <SelectItem value="justify">
      Justified
    </SelectItem>
  </Select>
</template>
