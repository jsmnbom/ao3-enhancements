<template lang="pug">
v-card
  v-card-text.text-center
    div(v-if='syncOptions.user')
      p.subtitle-1 Currently logged in as
      v-text-field.mx-auto.mb-2.align-center(
        hide-details,
        :value='syncOptions.user.username',
        single-line,
        disabled,
        filled,
        :style='{ width: `${syncOptions.user.username.length + 3}ch` }'
      )
      p The reading list collection will be created under this user. If you wish to use another user, please login to the other user on AO3 and click the refresh button.
    div(v-else)
      p.subtitle-1 The reading list feature requires that you are logged in to an AO3 account. Please login to an account on AO3 and then click the login button below.
      v-btn.ml-2(@click='login', :loading='loading', color='secondary')
        v-icon(left) {{ icons.mdiLogin }}
        span Login
  v-card-actions.flex-wrap
    v-btn(color='error', @click='syncDialog = false') Close
    v-spacer
    v-btn.ml-2(
      @click='login',
      :loading='loading',
      color='secondary',
      v-if='syncOptions.user'
    )
      v-icon(left) {{ icons.mdiReload }}
      span Refresh
    v-spacer
    v-btn(
      color='primary',
      @click='syncStep = 2',
      :disabled='!syncOptions.user'
    ) Next
</template>

<script lang="ts">
import { Vue, Component, PropSync } from 'vue-property-decorator';
import { mdiReload, mdiLogin } from '@mdi/js';

import { fetchAndParseDocument, getUser, Options } from '@/common';

@Component({
  inheritAttrs: false,
})
export default class UsernameStep extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  @PropSync('step') syncStep!: number;
  @PropSync('dialog') syncDialog!: boolean;

  loading = false;

  icons = {
    mdiReload,
    mdiLogin,
  };

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
      this.$notification.add(
        "No login found. Please ensure you're logged in on the AO3 website.",
        'error'
      );
      this.syncOptions.user = null;
    }
    this.loading = false;
  }
}
</script>
