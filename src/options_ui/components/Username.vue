<template lang="pug">
div
  v-text-field(
    label='Your AO3 username',
    filled,
    v-model='value',
    hide-details
  )
  p.body-2.text--secondary.mb-0 Your username is used for
    |
    |
    v-btn.text-none.pa-0(text, small, @click='$vuetify.goTo("#track-works")') Track Works
    | .
  p.body-2.text--secondary Please note that you need to be logged in on ArchiveOfOurOwn.org with this username for everything to work properly.
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { OPTION_IDS } from '@/common';

@Component
export default class Username extends Vue {
  @PropSync(OPTION_IDS.username, { type: String })
  value!: string;
}
</script>
