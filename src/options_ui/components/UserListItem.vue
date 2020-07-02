<template lang="pug">
v-list-item
  v-list-item-avatar(tile, v-if='opts.user')
    v-img(:src='opts.user.imgSrc', :alt='opts.user.imgAlt')
  v-list-item-content(v-if='opts.user')
    v-list-item-title {{opts.user.username }}
    v-list-item-subtitle Logged in as
  v-list-item-content(v-else)
    v-list-item-title Not logged in
  v-list-item-action
   v-tooltip(bottom)
      template(v-slot:activator="{ on, attrs }")
        v-btn(icon, v-on='on', v-bind='attrs', @click='login', :loading='loading')
          v-icon(color='grey lighten-1') {{opts.user ? icons.mdiReload : icons.mdiLogin }}
      span {{opts.user ? 'Refresh user info' : 'Login to AO3 account' }}
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiReload, mdiLogin } from '@mdi/js';

import { Options, fetchAndParseDocument, getUser } from '@/common';

@Component
export default class UserListItem extends Vue {
  @PropSync('options', { type: Object }) opts!: Options;

  icons = {
    mdiReload,
    mdiLogin,
  };

  loading = false;

  async login(): Promise<void> {
    this.loading = true;
    // Seems to be the most lightweight page that still has user data
    const siteMapUrl = 'https://archiveofourown.org/site_map';
    const doc = await fetchAndParseDocument(siteMapUrl);
    const user = getUser(doc);
    if (user) {
      this.$notification.add('Successfully logged in.', 'success');
      this.opts.user = user;
    } else {
      this.$notification.add(
        "No login found. Please ensure you're logged in on the AO3 website.",
        'error'
      );
      this.opts.user = null;
    }
    this.loading = false;
  }
}
</script>
