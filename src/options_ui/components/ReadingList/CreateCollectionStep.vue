<template lang="pug">
v-card
  v-card-text.text-center
    <!-- // TODO: Write some description text -->
    v-text-field(
      v-model='collectionId',
      label='Collection ID',
      counter,
      maxlength='255',
      hint='(A-Z, a-z, _, 0-9 only), no spaces, cannot begin or end with underscore',
      :rules='[rules.required, rules.length(255), rules.id, rules.underscore]'
    )
    <!-- // TODO: Figure out actual maxlength -->
    v-text-field(
      v-model='collectionName',
      label='Collection Name',
      counter,
      maxlength='255',
      :rules='[rules.required, rules.length(255)]'
    )
    v-textarea(
      v-model='collectionDescription',
      label='Collection Description',
      counter,
      maxlength='1250',
      :rules='[rules.length(1250)]'
    )
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

  collectionId = '1';
  collectionName = '2';
  collectionDescription = '3';

  rules = {
    required: (value: string): string | boolean => !!value || 'Required.',
    length: (length: number): ((value: string) => string | boolean) => {
      return (value) => value.length <= length || `Max ${length} characters`;
    },
    id: (value: string): string | boolean => {
      return (
        !!/^[A-Za-z_0-9]{0,255}$/.exec(value) ||
        'Must only contain A-Z, a-z, _, 0-9 with no spaces'
      );
    },
    underscore: (value: string): string | boolean => {
      return (
        !(value.startsWith('_') || value.endsWith('_')) ||
        'Cannot begin or end with underscore'
      );
    },
  };

  updatePlaceholders(): void {
    const username = this.syncOptions.user!.username;
    const psued = this.syncOptions.readingListPsued!;
    this.collectionId = `ao3e_reading_list_${psued!.id}`;
    this.collectionName = `Reading List for ${username}${
      username !== psued!.name ? ` (${psued!.name})` : ''
    }`;
    this.collectionDescription = `Collection managed by AO3 Enhancements Extension. Please do not change the items in it manually.`;
  }

  created(): void {
    this.updatePlaceholders();
  }

  get style(): { width: string } {
    return { width: `${Math.max(20, this.model?.length || 0) + 2}ch` };
  }

  abort(): void {
    this.create = false;
  }

  // TODO: Implement collection creation
}
</script>
