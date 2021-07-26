<template lang="pug">
v-card
  v-card-text.text-center
    <!-- // TODO: Write some description text -->
    v-text-field(
      label='Collection ID',
      counter,
      maxlength='255',
      hint='1 to 255 characters (A-Z, a-z, _, 0-9 only), no spaces, cannot begin or end with underscore'
    )
    <!-- // TODO: Figure out actual maxlength -->
    v-text-field(
      label='Collection Name',
      counter,
      maxlength='255',
      hint='1 to 255 characters'
    )
    v-textarea(label='Description', counter, maxlength='1250')
    p Further collection properties can be modified on AO3 after creation.
  v-card-actions.flex-wrap
    v-btn(color='error', @click='abort') Abort creation
    v-spacer
    v-btn(color='primary') Create
</template>

<script lang="ts">
import { Vue, Component, PropSync } from 'vue-property-decorator';
import { mdiReload, mdiLogin } from '@mdi/js';

import { Options } from '@/common';

@Component({
  inheritAttrs: false,
})
export default class CreateCollectionStep extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  @PropSync('step') syncStep!: number;
  @PropSync('creating') create!: boolean;
  @PropSync('dialog') syncDialog!: boolean;

  loading = false;

  search: null | string = null;
  model: null | string = null;

  icons = {
    mdiReload,
    mdiLogin,
  };

  items: string[] = [];

  get style(): { width: string } {
    return { width: `${Math.max(20, this.model?.length || 0) + 2}ch` };
  }

  abort(): void {
    this.create = false;
  }

  // TODO: Implement collection creation
  // TODO: Validate inputs
}
</script>
