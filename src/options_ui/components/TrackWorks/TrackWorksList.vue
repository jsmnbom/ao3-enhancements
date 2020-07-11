<template lang="pug">
.mt-4
  v-alert(text, dense, type='warning')
    span Track works is still a WIP (work in progress). This means that some parts might not always function properly:
    br
    span Tracking of visited and marked for later works is not implemented yet.
    br
    span Also note that if you use AO3 Enhancements on multiple devices, like your pc and your phone, and they are both logged into the same AO3 account, kudos might not show up on one device if you give them on the other device. The fix for now is to simply open the work on the other device that is missing the kudos - it should then update and realise that you have indeed given kudos. The same applies to subscribtions and bookmarks.
  p.subtitle-1.mt-1.mb-1.font-italic(aria-hidden='true') Track works I have...
  v-list(style='margin: 0 -24px;', :disabled='!_user')
    v-list-item-group(multiple, v-model='actualSelected')
      template(v-for='{ id, text, icon, implemented } in types')
        v-list-item(
          active-class='blue--text text--accent-4',
          tabindex='-1',
          :key='id',
          :value='id',
          :disabled='!_user || !implemented'
        )
          template(v-slot:default='{ active, toggle }')
            v-list-item-icon.mr-4.ml-2
              v-icon {{ icon }}
            v-list-item-content(aria-hidden='true')
              v-list-item-title ... {{ text + (implemented ? "" : " (not yet implemented)") }}
            v-list-item-action
              v-checkbox(
                :input-value='active',
                color='blue accent-4',
                @click='toggle',
                @change='toggle',
                :disabled='!_user',
                :aria-label='"Track works I have " + text + "." + (implemented ? "" : " (not yet implemented)")'
              )
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import {
  mdiEyeCheckOutline,
  mdiBookOutline,
  mdiHeartMultipleOutline,
  mdiClockTimeEightOutline,
  mdiBellCheckOutline,
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
    {
      id: 'kudos',
      text: 'given kudos to',
      icon: mdiHeartMultipleOutline,
      implemented: true,
    },
    {
      id: 'bookmarked',
      text: 'bookmarked',
      icon: mdiBookOutline,
      implemented: true,
    },
    {
      id: 'subscribed',
      text: 'subscribed',
      icon: mdiBellCheckOutline,
      implemented: true,
    },
    {
      // TODO: remind user to turn on at #preference_history_enabled
      id: 'visited',
      text: 'visited',
      icon: mdiEyeCheckOutline,
      implemented: false,
    },
    {
      id: 'later',
      text: 'marked for later',
      icon: mdiClockTimeEightOutline,
      implemented: false,
    },
  ];
}
</script>
