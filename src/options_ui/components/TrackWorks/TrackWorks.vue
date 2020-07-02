<template lang="pug">
category#track-works(,
  title='Track works',
  subtitle='Show which works you already know about.',
  :icon='icon',
  v-on='$listeners'
)
  v-alert(v-if='!options.user', text, dense, type='error') You must be logged in for this section to work. Please login on AO3 then press the login button in the sidebar.
  track-works-list(v-bind.sync='opts')
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiRadar } from '@mdi/js';

import { OPTION_IDS, Options } from '@/common';

import Category from '../Category.vue';

import TrackWorksList from './TrackWorksList.vue';

@Component({
  components: {
    TrackWorksList,
    Category,
  },
})
export default class BlurbStats extends Vue {
  @PropSync('options', { type: Object }) opts!: Options;

  option = OPTION_IDS;

  icon = mdiRadar;
}
</script>
