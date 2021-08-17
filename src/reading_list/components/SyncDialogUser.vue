<template lang="pug">
div(v-frag)
  v-text-field(
    outlined,
    label='Username',
    disabled,
    dense,
    hide-details,
    :value='syncOptions.user ? syncOptions.user.username : ""'
  )
  sync-dialog-help(inset) Username help
  v-btn.wrap(color='accent', tile, @click='login', :loading='loading') {{ syncOptions.user ? "Refresh" : "Login" }}
</template>

<script lang="ts">
import { Vue, Component, PropSync } from 'vue-property-decorator';

import { Options } from '@/common/options';
import { fetchAndParseDocument, getUser } from '@/common/utils';

import SyncDialogHelp from './SyncDialogHelp.vue';

@Component({ components: { SyncDialogHelp } })
export default class SyncDialogUser extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  loading = false;

  login(): void {
    (async () => {
      this.loading = true;
      // Seems to be the most lightweight page that still has user data
      const siteMapUrl = 'https://archiveofourown.org/site_map';
      const doc = await fetchAndParseDocument(siteMapUrl);
      const user = getUser(doc);
      if (user) {
        this.$notification.add('Successfully logged in.', 'success');
        this.syncOptions.user = user;
      } else {
        window.open('https://archiveofourown.org/users/login');
        this.syncOptions.user = null;
      }
      this.loading = false;
    })().catch((e) => console.error(e));
  }
}
</script>