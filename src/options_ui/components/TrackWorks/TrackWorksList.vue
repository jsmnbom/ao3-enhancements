<template lang="pug">
div.mt-4
  v-alert(text, dense, type='warning')
    span Track works is still a WIP (work in progress). This means that it might not always function properly.
    br
    span Currently known issues:
    ul
      li #[em 'Track works I have given kudos to'] will never recheck a work, so if you kudos a work on another device, it will not show up.
  p.subtitle-1.mt-1.mb-1.font-italic(aria-hidden='true') Track works I have...
  v-list(style='margin: 0 -24px;', :disabled='!_user')
    v-list-item-group(multiple, v-model='actualSelected')
      template(v-for='{ id, text, icon } in types')
        v-list-item(
          active-class='blue--text text--accent-4',
          tabindex='-1',
          :key='id',
          :value='id',
          :disabled='!_user'
        )
          template(v-slot:default='{ active, toggle }')
            v-list-item-icon.mr-4.ml-2
              v-icon {{ icon }}
            v-list-item-content(aria-hidden='true')
              v-list-item-title ... {{ text }}
            v-list-item-action
              v-checkbox(
                :input-value='active',
                color='blue accent-4',
                @click='toggle',
                @change='toggle',
                :disabled='!_user',
                :aria-label='"Track works I have " + text + "."'
              )
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import {
  mdiEyeCheckOutline,
  mdiBookOutline,
  mdiHeartMultipleOutline,
  mdiClockTimeEightOutline,
} from '@mdi/js';

import { OPTION_IDS, User } from '@/common';

@Component({
  inheritAttrs: false,
})
export default class TrackWorksList extends Vue {
  @PropSync(OPTION_IDS.trackWorks, { type: Array })
  selected!: string[];

  @PropSync(OPTION_IDS.user, { type: Object })
  _user!: User;

  get actualSelected(): string[] {
    if (!this._user) return [];
    return this.selected;
  }
  set actualSelected(selected: string[]) {
    this.selected = selected;
  }

  types = [
    { id: 'kudos', text: 'given kudos to', icon: mdiHeartMultipleOutline },
    { id: 'later', text: 'marked for later', icon: mdiClockTimeEightOutline },
    { id: 'bookmarked', text: 'bookmarked', icon: mdiBookOutline },
    { id: 'visited', text: 'visited', icon: mdiEyeCheckOutline },
    // TODO: remember user to turn on at #preference_history_enabled
  ];
}
</script>
