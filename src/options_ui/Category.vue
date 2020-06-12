<template lang="pug">
v-expansion-panel(open)
  v-expansion-panel-header
    slot(name='label')
  v-expansion-panel-content
    v-divider
    slot

</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({});
</script>
