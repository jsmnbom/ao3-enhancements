<template lang="pug">
div
  boolean-option(
    :options.sync='syncOptions',
    :id='option.hideTags',
    title='Hide works based on their tags'
  )
    div
      v-divider.mx-4
      v-combobox.mb-2.mt-5.mx-4(
        v-model.trim='syncOptions.hideTagsDenyList',
        label='Hide works with these tags:',
        multiple,
        chips,
        small-chips,
        dense,
        hide-details,
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
      v-combobox.mb-2.mt-5.mx-4(
        v-model.trim='syncOptions.hideTagsAllowList',
        label='...unless the work also has one of these tags:',
        multiple,
        chips,
        small-chips,
        hide-details,
        dense,
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
      tip The easiest way to add tags to these lists, is to simply right click on a tag on AO3 and then choosing to add it to the hide list.
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiCloseCircle } from '@mdi/js';

import { OPTION_IDS, Options } from '@/common';

import BooleanOption from '../BooleanOption.vue';
import Tip from '../Tip.vue';

@Component({
  components: {
    Tip,
    BooleanOption,
  },
})
export default class HideAuthors extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = OPTION_IDS;

  icons = {
    mdiCloseCircle,
  };

  colors = ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange'];
}
</script>
