<template lang="pug">
category#track-works(,
  title='Track works',
  subtitle='Show which works you already know about.',
  :icon='icon',
  v-on='$listeners'
)
  track-works-list(v-bind.sync='_options')
</template>

<script lang="ts">
import { Component, Vue, PropSync, Prop } from 'vue-property-decorator';
import { OPTION_IDS, Options } from '@/common';

import TrackWorksList from './TrackWorksList.vue';
import Category from '../Category.vue';
import { mdiRadar } from '@mdi/js';

@Component({
  components: {
    TrackWorksList,
    Category,
  },
})
export default class BlurbStats extends Vue {
  @PropSync('options', { type: Object }) _options!: Options;

  option = OPTION_IDS;

  icon = mdiRadar;
}
</script>
