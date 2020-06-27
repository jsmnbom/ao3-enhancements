<template lang="pug">
div
  v-switch.mt-2(
    hide-details,
    label='Hide works based on their tags.',
    v-model='enabled'
  )
  v-expand-transition
    div(v-show='enabled')
      v-combobox.mt-2(
        v-model.trim='denySelected',
        label='Hide works with these tagss:',
        hint='Use <enter> after each tag.',
        multiple,
        chips,
        small-chips,
        dense,
        :disabled='!enabled',
        filled,
        deletable-chips
      )
        template(v-slot:selection='{ attrs, item, parent, selected, index }')
          v-chip(
            v-bind='attrs',
            :class='[colors[index % colors.length], $vuetify.theme.dark ? "darken-2" : "lighten-2"]',
            :input-value='selected',
            label,
            small
          )
            span.pr-1 {{ item }}
            v-icon(small, @click='parent.selectItem(item)') {{ icons.mdiCloseCircle }}
      v-combobox(
        v-model.trim='allowSelected',
        label='...unless the work also has one of these tags:',
        hint='Use <enter> after each tag.',
        multiple,
        chips,
        small-chips,
        dense,
        :disabled='!enabled',
        v-show='enabled',
        filled,
        deletable-chips
      )
        template(v-slot:selection='{ attrs, item, parent, selected, index }')
          v-chip(
            v-bind='attrs',
            :class='[colors[index % colors.length], $vuetify.theme.dark ? "darken-2" : "lighten-2"]',
            :input-value='selected',
            label,
            small
          )
            span.pr-1 {{ item }}
            v-icon(small, @click='parent.selectItem(item)') {{ icons.mdiCloseCircle }}
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiCloseCircle } from '@mdi/js';

import { OPTION_IDS } from '@/common';

type Item = { text: string; value: string };

@Component
export default class HideAuthors extends Vue {
  @PropSync(OPTION_IDS.hideTags, { type: Boolean })
  enabled!: boolean;

  @PropSync(OPTION_IDS.hideTagsDenyList, { type: Array })
  denySelected!: Item[];

  @PropSync(OPTION_IDS.hideTagsAllowList, { type: Array })
  allowSelected!: Item[];

  icons = {
    mdiCloseCircle,
  };

  colors = ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange'];
}
</script>
