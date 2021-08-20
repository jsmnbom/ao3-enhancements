<template lang="pug">
v-dialog(max-width='300')
  template(v-slot:activator='{ on, attrs }')
    v-btn.activator(
      icon,
      v-bind='attrs',
      v-on='on',
      small,
      :class='{ inset: inset }'
    )
      v-icon {{ icons.mdiHelpCircleOutline }}
  template(v-slot:default='dialog')
    v-card
      v-card-text.pt-4
        slot
      v-card-actions.justify-end
        v-btn(text, @click='dialog.value = false') Close
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { mdiHelpCircleOutline } from '@mdi/js';

@Component
export default class SyncDialogHelp extends Vue {
  @Prop(Boolean) readonly inset!: boolean;
  icons = {
    mdiHelpCircleOutline,
  };
}
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/settings/_variables';
.inset {
  margin-left: -44px;
  margin-top: 5px;
  @media #{map-get($display-breakpoints, 'xs-only')} {
    margin-left: -34px;
  }
}
.activator {
  pointer-events: all;
}
</style>