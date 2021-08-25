<template lang="pug">
v-dialog(
  max-width='400',
  :fullscreen='$vuetify.breakpoint.xsOnly',
  ref='dialog'
)
  template(v-slot:activator='{ on, attrs }')
    v-btn.wrap(
      v-bind='attrs',
      v-on='on',
      color='accent',
      tile,
      :loading='loading',
      :disabled='!syncOptions.readingListPsued'
    ) Create new
  template(v-slot:default='dialog')
    v-card
      v-toolbar(
        color='secondary',
        dark,
        dense,
        style='position: sticky; top: 0; z-index: 10'
      )
        v-btn(icon, @click='dialog.value = false'): v-icon {{ $icons.mdiClose }}
        v-toolbar-title Create new collection
      v-card-text.text-center.pt-4.pb-0
        v-text-field(
          v-model='id',
          label='Collection ID',
          counter,
          maxlength='255',
          hint='(A-Z, a-z, _, 0-9 only), no spaces, cannot begin or end with underscore',
          :rules='[rules.required, rules.length(255), rules.id, rules.underscore]'
        )
        v-text-field(
          v-model='name',
          label='Collection Name',
          counter,
          maxlength='255',
          :rules='[rules.required, rules.length(255)]'
        )
        v-textarea(
          v-model='description',
          label='Collection Description',
          counter,
          maxlength='1250',
          :rules='[rules.length(1250)]'
        )
        p Further collection properties can be modified on AO3 after creation.
      v-card-actions.flex-wrap
        v-btn(color='error', @click='dialog.value = false', text) Abort creation
        v-spacer
        v-btn(color='primary', @click='create', :loading='loading') Create
</template>

<script lang="ts">
import { Vue, Component, PropSync, Watch, Ref } from 'vue-property-decorator';

import { Options } from '@/common/options';
import { fetchToken, getIconBlob, safeFetch, toDoc } from '@/common/utils';

@Component
export default class SyncCollectionCreate extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  @Ref('dialog') dialog!: { isActive: boolean };

  id = '1';
  name = '2';
  description = '3';
  loading = false;

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

  @Watch('syncOptions.readingListPsued')
  onPseudChange(): void {
    this.updatePlaceholders();
  }

  mounted(): void {
    this.updatePlaceholders();
  }

  updatePlaceholders(): void {
    const username = this.syncOptions.user?.username;
    const psued = this.syncOptions.readingListPsued;
    if (!username || !psued) return;
    this.id = `ao3e_reading_list_data_container_${psued!.id}`;
    this.name = `Reading List Data for ${username}${
      username !== psued!.name ? ` (${psued!.name})` : ''
    }`;
    this.description = `This collection is maintained by AO3 Enhancements and contains (in the introduction field) your data, for easy sync between your devices. Works are *not* added normally, do not expect to be able to see them.`;
  }

  async create(): Promise<void> {
    this.loading = true;
    const data = new FormData();

    data.append('utf8', '✓');
    data.append('authenticity_token', await fetchToken());
    data.append('owner_pseuds[]', `${this.syncOptions.readingListPsued!.id}`);
    data.append('collection[name]', this.id);
    data.append('collection[title]', this.name);
    data.append('collection[parent_name]', '');
    data.append('collection[email]', '');
    data.append('collection[header_image_url]', '');
    data.append('collection[icon]', await getIconBlob(), 'icon.png');
    data.append('collection[icon_alt_text]', 'AO3 Enhancements Icon');
    data.append('collection[icon_comment_text]', '');
    data.append('collection[description]', this.description);
    data.append('collection[collection_preference_attributes][moderated]', '1');
    data.append('collection[collection_preference_attributes][closed]', '1');
    data.append(
      'collection[collection_preference_attributes][unrevealed]',
      '1'
    );
    data.append('collection[collection_preference_attributes][anonymous]', '1');
    data.append(
      'collection[collection_preference_attributes][show_random]',
      '0'
    );
    data.append(
      'collection[collection_preference_attributes][email_notify]',
      '0'
    );
    data.append('challenge_type', '');
    data.append('collection[collection_profile_attributes][intro]', '');
    data.append('collection[collection_profile_attributes][faq]', '');
    data.append('collection[collection_profile_attributes][rules]', '');
    data.append(
      'collection[collection_profile_attributes][assignment_notification]',
      ''
    );
    data.append(
      'collection[collection_profile_attributes][gift_notification]',
      ''
    );
    data.append('commit', 'Submit');

    try {
      const res = await safeFetch(`https://archiveofourown.org/collections`, {
        method: 'POST',
        body: data,
      });
      const paths = new URL(res.url).pathname.split('/');
      if (paths.length !== 3) {
        const doc = await toDoc(res);
        const error = doc.querySelector('.error ul')?.textContent;
        this.$notification.add(
          `Could not create collection: ${error}`,
          'error'
        );
        return;
      }
    } catch (e) {
      this.$notification.add(`Could not create collection: ${e}`, 'error');
      return;
    } finally {
      this.loading = false;
    }
    this.$notification.add('Collection created.', 'success');
    this.$emit('create', this.id);
    this.dialog.isActive = false;
  }
}
</script>