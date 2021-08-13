<template lang="pug">
v-dialog(
  max-width='400',
  :fullscreen='$vuetify.breakpoint.xsOnly',
  ref='dialog'
)
  template(v-slot:activator='{ on, attrs }')
    v-btn(
      v-bind='attrs',
      v-on='on',
      color='accent',
      loading='loading',
      tile,
      :disabled='!syncOptions.user'
    ) Create new
  template(v-slot:default='dialog')
    v-card
      v-toolbar(
        color='secondary',
        dark,
        dense,
        style='position: sticky; top: 0; z-index: 10'
      )
        v-btn(icon, @click='dialog.value = false'): v-icon {{ icons.mdiClose }}
        v-toolbar-title Create new pseud
      v-card-text.text-center.pt-4.pb-0
        <!-- // TODO: Figure out actual maxlength -->
        v-text-field(
          v-model='name',
          label='Pseud Name',
          counter,
          maxlength='255',
          :rules='[rules.required, rules.length(255)]'
        )
        v-textarea(
          v-model='description',
          label='Pseud Description',
          counter,
          maxlength='500',
          :rules='[rules.length(500)]'
        )
        p Further pseud properties can be modified on AO3 after creation.
      v-card-actions.flex-wrap
        v-btn(color='error', @click='dialog.value = false', text) Abort creation
        v-spacer
        v-btn(color='primary', @click='create', :loading='loading') Create
</template>

<script lang="ts">
import { Vue, Component, PropSync, Ref } from 'vue-property-decorator';
import { mdiClose } from '@mdi/js';

import { fetchToken, getIconBlob, Options, safeFetch, toDoc } from '@/common';

@Component
export default class SyncCreatePseud extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  @Ref('dialog') dialog!: { isActive: boolean };

  icons = {
    mdiClose,
  };

  name = 'Reading List';
  description = 'Pseud for use with AO3 Enhancements Reading List.';
  loading = false;

  rules = {
    required: (value: string): string | boolean => !!value || 'Required.',
    length: (length: number): ((value: string) => string | boolean) => {
      return (value) => value.length <= length || `Max ${length} characters`;
    },
  };

  create(): void {
    (async () => {
      this.loading = true;
      const data = new FormData();

      data.append('utf8', '✓');
      data.append('authenticity_token', await fetchToken());
      data.append('pseud[name]', this.name);
      data.append('pseud[is_default]', '0');
      data.append('pseud[description]', this.description);
      data.append('pseud[icon]', await getIconBlob(), 'icon.png');
      data.append('pseud[icon_alt_text]', 'AO3 Enhancements Icon');
      data.append('pseud[icon_comment_text]', '');
      data.append('commit', 'Create');

      try {
        const res = await safeFetch(
          `https://archiveofourown.org/users/${
            this.syncOptions.user!.username
          }/pseuds`,
          { method: 'POST', body: data }
        );
        const paths = new URL(res.url).pathname.split('/');
        if (paths.length !== 5) {
          const doc = await toDoc(res);
          const error = doc.querySelector('.flash.error')?.textContent;
          this.$notification.add(`Could not create pseud: ${error}`, 'error');
          return;
        }
      } catch (e) {
        this.$notification.add(`Could not create pseud: ${e}`, 'error');
        return;
      }
      this.$notification.add('Pseud created.', 'success');
      this.$emit('create', this.name);
      this.dialog.isActive = false;
    })()
      .catch((e) => console.error(e))
      .finally(() => {
        this.loading = false;
      });
  }
}
</script>