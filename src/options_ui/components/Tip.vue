<template lang="pug">
v-alert.mx-4.body-2.text--secondary.ultradense.mt-1(
  :icon='icon',
  style='position: unset'
) 
  slot
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mdiInformationOutline } from '@mdi/js';

@Component
export default class Tip extends Vue {
  @Prop({ default: mdiInformationOutline }) readonly icon!: string;
}
</script>

<style scoped>
.v-alert.ultradense {
  padding: 0;
}
.v-alert.ultradense >>> .v-alert__wrapper .v-icon {
  margin-right: 8px;
}
</style>