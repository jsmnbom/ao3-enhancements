<template lang="pug">
category#reading-list(
  title='Reading List',
  subtitle='Personal reading list sync options.',
  :icon='icons.mdiAccountBox',
  v-on='$listeners'
)
  v-dialog(
    v-model='dialog',
    max-width='600px',
    :fullscreen='$vuetify.breakpoint.xsOnly'
  )
    v-card
      v-toolbar(color='primary', dark, v-if='$vuetify.breakpoint.xsOnly')
        v-btn(icon, @click='dialog = false')
          v-icon {{ icons.mdiClose }}
        v-toolbar-title Reading List Collection and User
      v-card-text.pa-0
        v-stepper(v-model='step')
          v-stepper-header
            v-stepper-step(step='1') Login
            v-divider
            v-stepper-step(step='2') Pseud
            v-divider
            v-stepper-step(step='3', v-if='creatingCollection') Create collection
            v-stepper-step(step='3', v-else) Choose collection
          v-stepper-items
            v-stepper-content(step='1')
              UsernameStep(
                :options.sync='syncOptions',
                :step.sync='step',
                :dialog.sync='dialog'
              )
            v-stepper-content(step='2')
              PseudStep(:options.sync='syncOptions', :step.sync='step')
            v-stepper-content(step='3', v-if='creatingCollection')
              CreateCollectionStep(
                :options.sync='syncOptions',
                :step.sync='step',
                :creating.sync='creatingCollection',
                :dialog.sync='dialog'
              )
            v-stepper-content(step='3', v-else)
              CollectionStep(
                :options.sync='syncOptions',
                :step.sync='step',
                :creating.sync='creatingCollection',
                :dialog.sync='dialog'
              )
  v-divider
  v-alert.ma-4(dense, outlined, type='warning') Reading List is a feature currently in beta. The extension author takes no responsibility for any data you might lose while using it. That being said, it has been fairly well tested, and the worst that should happen is losing bookmarks.
  v-divider
  v-row.px-4.align-center(
    style='min-height: 5em',
    @click='dialog = true; step = 1'
  )
    v-col.d-flex.flex-column.justify-center
      span.text-subtitle-2(
        :class='["text-subtitle-2", $vuetify.theme.dark ? "white--text" : "black--text"].join(" ")'
      ) Collection and user
      span.text-subtitle-2.grey--text {{ syncOptions.readingListCollectionId || "Not configured" }}
    v-col.flex-grow-0 
      v-icon {{ icons.mdiChevronRight }}
  v-divider
  v-row.px-4.align-center(style='min-height: 5em')
    v-col.d-flex.flex-column.justify-center
      span.text-subtitle-2(
        :class='["text-subtitle-2", $vuetify.theme.dark ? "white--text" : "black--text"].join(" ")'
      ) Automatically mark chapter as read when scrolled down
  v-divider
</template> 

<script lang="ts">
import { Component, Vue, PropSync, Watch } from 'vue-property-decorator';
import { mdiAccountBox, mdiChevronRight, mdiClose } from '@mdi/js';

import { Options, OPTION_IDS } from '@/common';

import Category from '../Category.vue';
import SliderOption from '../SliderOption.vue';
import Tip from '../Tip.vue';

import UsernameStep from './UsernameStep.vue';
import PseudStep from './PseudStep.vue';
import CollectionStep from './CollectionStep.vue';
import CreateCollectionStep from './CreateCollectionStep.vue';

@Component({
  components: {
    SliderOption,
    Category,
    Tip,
    UsernameStep,
    PseudStep,
    CollectionStep,
    CreateCollectionStep,
  },
})
export default class ReadingList extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  dialog = false;
  step = 1;
  creatingCollection = false;
  icons = {
    // TODO: Find better icon
    mdiAccountBox,
    mdiChevronRight,
    mdiClose,
  };
  option = OPTION_IDS;

  @Watch('step')
  onStep(step: number): void {
    console.log(step, this.step, this.creatingCollection);
  }
  @Watch('create')
  onCreate(create: number): void {
    console.log(create, this.step, this.creatingCollection);
  }
}
</script>
