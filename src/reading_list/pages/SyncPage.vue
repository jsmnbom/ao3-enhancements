<template lang="pug">
div(style='z-index: 5; position: relative')
  v-card.pa-0.sharp.mt-0.mt-sm-n16
    v-toolbar.elevation-0.ao3-red-bg(v-if='$vuetify.breakpoint.xsOnly', dark) 
      v-app-bar-nav-icon(
        @click.stop='$root.$children[0].drawer = !$root.$children[0].drawer'
      )
      v-toolbar-title Sync
    v-card-text.pa-0: v-stepper.pb-4(v-model='step', vertical)
      v-stepper-step(step='1', editable) Purpose and information
      v-stepper-content(step='1')
        sync-info
        v-btn(color='primary', @click='step = 2') Continue
        v-btn(text, @click='syncOpen = false') Close
      v-stepper-step(step='2', editable) Login and configuration
      v-stepper-content(step='2')
        p.text-body-2.text--secondary Note that ALL of these values MUST match on all devices that you want use sync on.
        v-form.grid.pt-2.pb-2.pb-sm-4
          sync-user(:options.sync='syncOptions')
          sync-pseud(:options.sync='syncOptions')
          sync-collection(:options.sync='syncOptions')
          sync-read-date-resolution(:options.sync='syncOptions')
          sync-private-bookmarks(:options.sync='syncOptions')
        v-btn(
          color='primary',
          @click='step = 3',
          :disabled='!syncOptions.readingListCollectionId'
        ) Continue
        v-btn(text, @click='step = 1') Back
      v-stepper-step(
        step='3',
        :editable='!!syncOptions.readingListCollectionId'
      ) Sync
      v-stepper-content(step='3')
        sync-conflict-dialog(
          :conflict='conflict',
          @resolve='conflictResolver($event)'
        )
        sync-missing-data-warning-dialog(
          :visible='missingDataWarning.visible',
          :count='missingDataWarning.count',
          @resolve='missingDataWarningResolver($event)'
        )
        p.text-body-2.text--secondary {{ syncing ? "Syncing... Please keep this tab/window open." : "Ready to sync, press the button below to start." }}
        sync-status(
          :syncing='syncing',
          :complete='complete',
          :steps='loadingSteps'
        )
        v-alert(v-if='error', text, prominent, type='error')
          p {{ error.message }}
          p(v-if='error.contextURL') Context: #[a(:href='error.contextURL', target) {{ error.contextURL }}]
        v-btn(color='primary', @click='startSync', :disabled='syncing') {{ error ? "Retry sync" : "Start sync" }}
        v-btn(text, @click='step = 2', :disabled='syncing') Back
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch } from 'vue-property-decorator';
import { NavigationGuardNext, Route } from 'vue-router';

import { Options } from '@/common/options';
import { SyncConflict } from '@/common/readingListData';
import { api, SyncError } from '@/common/api';

import SyncPseud from '../components/SyncPseud.vue';
import SyncUser from '../components/SyncUser.vue';
import SyncCollection from '../components/SyncCollection.vue';
import SyncConflictDialog from '../components/SyncConflictDialog.vue';
import SyncReadDateResolution from '../components/SyncReadDateResolution.vue';
import SyncPrivateBookmarks from '../components/SyncPrivateBookmarks.vue';
import SyncMissingDataWarningDialog from '../components/SyncMissingDataWarningDialog.vue';
import SyncInfo from '../components/SyncInfo.vue';
import SyncStatus from '../components/SyncStatus.vue';

@Component({
  components: {
    SyncUser,
    SyncPseud,
    SyncCollection,
    SyncConflictDialog,
    SyncReadDateResolution,
    SyncPrivateBookmarks,
    SyncMissingDataWarningDialog,
    SyncInfo,
    SyncStatus,
  },
})
export default class SyncPage extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  step = 1;
  loadingSteps: string[] = [];
  syncing = false;
  complete = false;
  error: { message: string; contextURL?: string } | null = null;
  conflict: SyncConflict | null = null;
  missingDataWarning: { visible: boolean; count: number } = {
    visible: false,
    count: 0,
  };

  conflictResolver: ((value: 'local' | 'remote') => void) | null = null;
  missingDataWarningResolver:
    | ((value: 'force' | 'blank' | 'abort') => void)
    | null = null;

  @Watch('syncing')
  onSyncing(syncing: boolean): void {
    if (syncing) {
      window.addEventListener('beforeunload', this.preventNav);
      this.$once('hook:beforeDestroy', () => {
        window.removeEventListener('beforeunload', this.preventNav);
      });
    } else {
      window.removeEventListener('beforeunload', this.preventNav);
    }
  }

  beforeRouteEnter(
    _to: Route,
    _from: Route,
    next: NavigationGuardNext<SyncPage>
  ): void {
    next((vm) => {
      if (vm.syncOptions.readingListCollectionId && vm.step === 1) {
        vm.step = 3;
      }
      if (!vm.syncing) {
        vm.complete = false;
        vm.error = null;
      }
    });
  }

  beforeRouteLeave(
    _to: Route,
    _from: Route,
    next: NavigationGuardNext<SyncPage>
  ): void {
    if (this.syncing) {
      const answer = window.confirm(
        'Do you really want to leave? Sync is in progress.'
      );
      if (!answer) {
        next(false);
        return;
      }
    }
    next();
  }

  preventNav = (event: Event): string => {
    event.preventDefault();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (event.returnValue = '');
  };

  async startSync(): Promise<void> {
    this.syncing = true;
    this.complete = false;
    this.error = null;
    this.loadingSteps = [];

    const conflictHandler: Parameters<
      typeof api.readingListSyncConflict.addListener
    >[0] = (conflict) => {
      this.conflict = conflict;
      return new Promise((resolve) => {
        this.conflictResolver = (value) => {
          this.conflict = null;
          this.conflictResolver = null;
          resolve(value);
        };
      });
    };
    const progressHandler: Parameters<
      typeof api.readingListSyncProgress.addListener
    >[0] = async ({ progress, complete, overwrite }) => {
      this.complete = complete;
      this.syncing = !complete;
      if (overwrite) {
        Vue.set(this.loadingSteps, this.loadingSteps.length - 1, progress);
      } else {
        this.loadingSteps.push(progress);
      }
      if (this.complete) {
        api.readingListSyncProgress.removeListener(progressHandler);
        api.readingListSyncConflict.removeListener(conflictHandler);
        api.readingListSyncMissingDataWarning.removeListener(
          missingDataWarningHandler
        );
      }
    };
    const missingDataWarningHandler: Parameters<
      typeof api.readingListSyncMissingDataWarning.addListener
    >[0] = async ({ count }) => {
      return new Promise((resolve) => {
        this.missingDataWarning = {
          visible: true,
          count,
        };
        this.missingDataWarningResolver = (value) => {
          this.missingDataWarning.visible = false;
          resolve(value);
        };
      });
    };

    api.readingListSyncConflict.addListener(conflictHandler);
    api.readingListSyncProgress.addListener(progressHandler);
    api.readingListSyncMissingDataWarning.addListener(
      missingDataWarningHandler
    );
    try {
      await api.readingListSync.sendBG();
    } catch (e) {
      this.syncing = false;
      this.complete = false;
      api.readingListSyncProgress.removeListener(progressHandler);
      api.readingListSyncConflict.removeListener(conflictHandler);
      api.readingListSyncMissingDataWarning.removeListener(
        missingDataWarningHandler
      );
      if (e instanceof Error) {
        if (e.name === 'SyncAbort') {
          this.error = e;
        } else if (e.name == 'SyncError') {
          this.error = e as SyncError;
        } else {
          this.error = {
            message: `Unknown error in sync code. Advanced details:\n${e}`,
          };
        }
      } else {
        this.error = { message: 'Unknown sync error!' };
        throw e;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/settings/_variables';
.grid {
  display: grid;
  gap: 16px 8px;
  grid-template: 1fr / 1fr 0px min-content;
  @media #{map-get($display-breakpoints, 'xs-only')} {
    grid-template: 1fr / 1fr 0px;
    gap: 4px 0px;
    ::v-deep > .wrap {
      grid-column: span 2;
      margin-bottom: 16px;
    }
  }
}

.v-stepper {
  ::v-deep .v-stepper__wrapper {
    margin-top: -16px;
  }
  ::v-deep .v-stepper__step {
    padding: 16px 24px 8px;
  }
}

.sharp {
  border-radius: 0 !important;
  ::v-deep > *::before {
    box-shadow: none;
  }
}
</style>