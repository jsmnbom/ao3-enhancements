<template lang="pug">
v-dialog(
  v-model='syncOpen',
  max-width='600px',
  :fullscreen='$vuetify.breakpoint.xsOnly'
): v-card.pa-0
  v-toolbar(
    color='secondary',
    dark,
    dense,
    style='position: sticky; top: 0; z-index: 10'
  )
    v-btn(icon, @click='syncOpen = false'): v-icon {{ icons.mdiClose }}
    v-toolbar-title Sync
  v-divider
  v-card-text.pa-0: v-stepper.pb-4(v-model='step', vertical)
    v-stepper-step(step='1', editable) Purpose and information
    v-stepper-content(step='1')
      v-list
        v-subheader The AO3 Enhancements Reading List Sync feature is responsible for two things:
        v-list-item: v-list-item-content
          v-list-item-title Work updates
          v-list-item-subtitle.text-wrap Using native AO3 bookmarks, AO3 Enhancements is able to easily check if any of the works on your reading list have been updated, and will update the reading list accordingly.
        v-divider
        v-list-item: v-list-item-content
          v-list-item-title Cross device sync
          v-list-item-subtitle.text-wrap Your Reading List will be uploaded to AO3, so if you install this extension on another device and configure it the same, your reading list can be easily synced.
        v-subheader 
          | For more info on the Reading List sync please see the deticated&nbsp;
          a(
            href='https://github.com/jsmnbom/ao3-enhancements/wiki/Reading-List-and-Sync-FAQ',
            target='_blank'
          ) FAQ page
          | .
        v-subheader Press the button below to get started.
      v-btn(color='primary', @click='step = 2') Continue
      v-btn(text, @click='syncOpen = false') Close
    v-stepper-step(step='2', editable) Login and configuration
    v-stepper-content(step='2')
      p.text-body-2.text--secondary Note that ALL of these values MUST match on all devices that you want use sync on.

      v-form.grid.pt-2.pb-2.pb-sm-4
        v-text-field(
          outlined,
          label='Username',
          disabled,
          dense,
          hide-details,
          :value='syncOptions.user ? syncOptions.user.username : ""'
        )
        sync-help Username help
        v-btn(color='accent', tile, @click='login', :loading='loginLoading') {{ syncOptions.user ? "Refresh" : "Login" }}

        sync-pseud(
          :options.sync='syncOptions',
          :created-name='psuedCreatedName'
        )
        sync-help Psued help
        sync-create-pseud(
          :options.sync='syncOptions',
          @create='psuedCreatedName = $event'
        )

        sync-collection(
          :options.sync='syncOptions',
          :created-id='collectionCreatedId'
        )
        sync-help Collection help
        sync-create-collection(
          :options.sync='syncOptions',
          @create='collectionCreatedId = $event'
        )

        p // TODO: Add option to disregard readdates
      v-btn(
        color='primary',
        @click='step = 3',
        :disabled='!syncOptions.readingListCollectionId'
      ) Continue
      v-btn(text, @click='step = 1') Back
    v-stepper-step(step='3', :editable='!!syncOptions.readingListCollectionId') Sync
    v-stepper-content(step='3')
      sync-conflict(:conflict='conflict', @resolve='conflictResolver($event)')
      p.text-body-2.text--secondary {{ syncing ? "&nbsp;" : "Ready to sync, press the button below to start." }}
      .sync-status(:class='syncing || syncComplete ? "active" : ""')
        .d-flex.justify-center(style='height: 7em')
          .circle-loader(:class='syncComplete ? "load-complete" : ""')
            .checkmark.draw(v-if='syncComplete')
        .log
          .subtitle-1.text--secondary(
            v-for='(step, index) in loadingSteps',
            :key='index'
          ) {{ step }}
      div
        v-btn(color='primary', @click='startSync', :disabled='syncing') Start sync
        v-btn(text, @click='step = 2', :disabled='syncing') Back
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch } from 'vue-property-decorator';
import { mdiClose, mdiInformation, mdiHelpCircleOutline } from '@mdi/js';

import {
  api,
  Conflict,
  fetchAndParseDocument,
  getUser,
  Options,
} from '@/common';

import SyncPseud from './SyncPsued.vue';
import SyncCollection from './SyncCollection.vue';
import SyncCreateCollection from './SyncCreateCollection.vue';
import SyncCreatePseud from './SyncCreatePseud.vue';
import SyncHelp from './SyncHelp.vue';
import SyncConflict from './SyncConflict.vue';

@Component({
  components: {
    SyncPseud,
    SyncCollection,
    SyncCreateCollection,
    SyncCreatePseud,
    SyncHelp,
    SyncConflict,
  },
})
export default class Sync extends Vue {
  @PropSync('open') syncOpen!: boolean;

  @PropSync('options', { type: Object }) syncOptions!: Options;

  step = 1;
  loginLoading = false;
  psuedCreatedName: string | null = null;
  collectionCreatedId: string | null = null;
  loadingSteps: string[] = [];
  syncing = false;
  syncComplete = false;
  conflict: Conflict | null = null;

  icons = {
    mdiClose,
    mdiInformation,
    mdiHelpCircleOutline,
  };
  conflictResolver: ((value: 'local' | 'remote') => void) | null = null;

  @Watch('syncOptions.readingListCollectionId')
  onreadingListCollectionIdChange(): void {
    // TODO: maybe watch open instead
    if (this.step === 1) {
      this.step = 3;
    }
  }

  login(): void {
    (async () => {
      this.loginLoading = true;
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
      this.loginLoading = false;
    })().catch((e) => console.error(e));
  }

  startSync(): void {
    this.syncing = true;
    this.syncComplete = false;
    api.readingListSyncProgress.addListener(
      async ({ progress, complete, overwrite }) => {
        this.syncComplete = complete;
        this.syncing = !complete;
        if (overwrite) {
          Vue.set(this.loadingSteps, this.loadingSteps.length - 1, progress);
        } else {
          this.loadingSteps.push(progress);
        }
      }
    );
    api.readingListSyncConflict.addListener((conflict) => {
      this.conflict = conflict;
      return new Promise((resolve) => {
        this.conflictResolver = (value) => {
          this.conflict = null;
          this.conflictResolver = null;
          resolve(value);
        };
      });
    });

    api.readingListSync.sendBG().catch((e) => console.error(e));
  }
}
</script>

<style lang="scss">
$loader-size: 7em;
$check-height: $loader-size/2;
$check-width: $check-height/2;
$check-left: ($loader-size/6 + $loader-size/12);
$check-thickness: 3px;
$check-color: #5cb85c;

.circle-loader {
  margin-bottom: $loader-size/2;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-left-color: $check-color;
  animation: loader-spin 1.2s infinite linear;
  position: relative;
  display: inline-block;
  vertical-align: top;
  border-radius: 50%;
  width: $loader-size;
  height: $loader-size;
}

.load-complete {
  -webkit-animation: none;
  animation: none;
  border-color: $check-color;
  transition: border 500ms ease-out;
}

.checkmark {
  &.draw:after {
    animation-duration: 800ms;
    animation-timing-function: ease;
    animation-name: checkmark;
    transform: scaleX(-1) rotate(135deg);
  }

  &:after {
    opacity: 1;
    height: $check-height;
    width: $check-width;
    transform-origin: left top;
    border-right: $check-thickness solid $check-color;
    border-top: $check-thickness solid $check-color;
    content: '';
    left: $check-left;
    top: $check-height;
    position: absolute;
  }
}

@keyframes loader-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes checkmark {
  0% {
    height: 0;
    width: 0;
    opacity: 1;
  }
  20% {
    height: 0;
    width: $check-width;
    opacity: 1;
  }
  40% {
    height: $check-height;
    width: $check-width;
    opacity: 1;
  }
  100% {
    height: $check-height;
    width: $check-width;
    opacity: 1;
  }
}
.log {
  padding: 16px 0;
  overflow-y: hidden;
  overflow-x: hidden;
  height: 64px;
  text-align: center;
  position: relative;
  > div {
    position: absolute;
    width: 100%;
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    &:not(:last-child) {
      animation: scroll-out 0.3s forwards;
    }
    &:last-child {
      animation: scroll-in 0.3s forwards;
    }
  }
}
@keyframes scroll-in {
  0% {
    transform: translate(0, 16px);
    opacity: 0;
  }
  100% {
    transform: translate(0, 0);
    opacity: 1;
  }
}
@keyframes scroll-out {
  0% {
    transform: translate(0, 0px);
    opacity: 1;
  }
  100% {
    transform: translate(0, -16px);
    opacity: 0;
  }
}
.sync-status {
  height: 0;
  transition: cubic-bezier(0.65, 0, 0.35, 1) 0.3s;
  overflow: hidden;
  &.active {
    height: 160px;
  }
}
</style>

<style lang="scss" scoped>
@import '~vuetify/src/styles/settings/_variables';
.text-wrap {
  white-space: wrap;
}
.v-list {
  ::v-deep .v-list-item,
  ::v-deep .v-subheader {
    padding: 0;
  }
  ::v-deep .v-subheader {
    height: 32px;
  }
}
.grid {
  display: grid;
  gap: 16px 8px;
  grid-template: 1fr / 1fr 0px min-content;
  @media #{map-get($display-breakpoints, 'xs-only')} {
    grid-template: 1fr / 1fr 0px;
    gap: 4px 0px;
    ::v-deep > .v-btn:not(.activator) {
      grid-column: span 2;
      margin-bottom: 16px;
    }
  }
}

.v-input ::v-deep .v-btn {
  pointer-events: all;
}
.v-autocomplete ::v-deep .v-input__slot {
  padding-right: 32px !important;
}
.v-stepper {
  ::v-deep .v-stepper__wrapper {
    margin-top: -16px;
  }
  ::v-deep .v-stepper__step {
    padding: 16px 24px 8px;
  }
}
</style>