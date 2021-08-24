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
  sync-dialog-help(inset)
    p Sync needs you to be logged in on ArchiveOfOurOwn. It also needs to know your username to be able to do its magic. Your login is usually auto detected. If this is not the case then please go to the #[a(href='https://archiveofourown.org/users/login', target='_blank') AO3 login page] to login, and then come back here.
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

  async login(): Promise<void> {
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
  }
}
</script>