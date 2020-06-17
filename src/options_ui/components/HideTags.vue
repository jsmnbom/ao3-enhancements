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
            :class='[colors[index % colors.length], $vuetify.dark ? "lighten-2" : "darken-2"]',
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
            :class='[colors[index % colors.length], $vuetify.dark ? "lighten-2" : "darken-2"]',
            :input-value='selected',
            label,
            small
          )
            span.pr-1 {{ item }}
            v-icon(small, @click='parent.selectItem(item)') {{ icons.mdiCloseCircle }}
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { mdiCloseCircle } from '@mdi/js';
import { log, error, getOption, setOption, optionIds } from '@/common';

type Item = { text: string; value: string };

@Component
export default class HideAuthors extends Vue {
  enabled = false;
  enabledId = optionIds.hideTags;
  denyId = optionIds.hideTagsDenyList;
  allowId = optionIds.hideTagsAllowList;
  denySelected = [] as string[];
  allowSelected = [] as string[];
  ready = false;

  icons = {
    mdiCloseCircle,
  };

  colors = ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange'];

  async created() {
    this.enabled = await getOption(this.enabledId);
    this.denySelected = await getOption(this.denyId);
    this.allowSelected = await getOption(this.allowId);
    this.$nextTick(() => {
      this.ready = true;
    });
  }

  @Watch('enabled')
  async watchEnabled(newValue: boolean) {
    if (!this.ready) return;
    await setOption(this.enabledId, newValue);
  }
  @Watch('denySelected')
  async watchDenySelected(selected: Item[]) {
    if (!this.ready) return;
    await setOption(this.denyId, selected);
  }
  @Watch('allowSelected')
  async watchAllowSelected(selected: Item[]) {
    if (!this.ready) return;
    await setOption(this.allowId, selected);
  }
}
</script>
