<template lang="pug">
v-dialog(
  v-model='syncOpen',
  :persistent='syncing',
  max-width='600px',
  :fullscreen='$vuetify.breakpoint.xsOnly'
): v-card.pa-0
  v-toolbar(
    color='secondary',
    dark,
    dense,
    style='position: sticky; top: 0; z-index: 10'
  )
    v-btn(icon, @click='syncOpen = syncing'): v-icon {{ icons.mdiClose }}
    v-toolbar-title Sync
  v-divider
  v-card-text.pa-0: v-stepper.pb-4(v-model='step', vertical)
    v-stepper-step(step='1', editable) Purpose and information
    v-stepper-content(step='1')
      sync-dialog-info
      v-btn(color='primary', @click='step = 2') Continue
      v-btn(text, @click='syncOpen = false') Close
    v-stepper-step(step='2', editable) Login and configuration
    v-stepper-content(step='2')
      p.text-body-2.text--secondary Note that ALL of these values MUST match on all devices that you want use sync on.
      v-form.grid.pt-2.pb-2.pb-sm-4
        sync-dialog-user(:options.sync='syncOptions')
        sync-dialog-pseud(:options.sync='syncOptions')
        sync-dialog-collection(:options.sync='syncOptions')
        sync-dialog-read-date-resolution(:options.sync='syncOptions')
        sync-dialog-private-bookmarks(:options.sync='syncOptions')
      v-btn(
        color='primary',
        @click='step = 3',
        :disabled='!syncOptions.readingListCollectionId'
      ) Continue
      v-btn(text, @click='step = 1') Back
    v-stepper-step(step='3', :editable='!!syncOptions.readingListCollectionId') Sync
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
      sync-dialog-status(
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
import { mdiClose } from '@mdi/js';

import { Options } from '@/common/options';
import { SyncConflict } from '@/common/readingListData';
import { api, SyncError } from '@/common/api';

import SyncDialogPseud from './SyncDialogPseud.vue';
import SyncDialogUser from './SyncDialogUser.vue';
import SyncDialogCollection from './SyncDialogCollection.vue';
import SyncConflictDialog from './SyncConflictDialog.vue';
import SyncDialogReadDateResolution from './SyncDialogReadDateResolution.vue';
import SyncDialogPrivateBookmarks from './SyncDialogPrivateBookmarks.vue';
import SyncMissingDataWarningDialog from './SyncMissingDataWarningDialog.vue';
import SyncDialogInfo from './SyncDialogInfo.vue';
import SyncDialogStatus from './SyncDialogStatus.vue';

@Component({
  components: {
    SyncDialogUser,
    SyncDialogPseud,
    SyncDialogCollection,
    SyncConflictDialog,
    SyncDialogReadDateResolution,
    SyncDialogPrivateBookmarks,
    SyncMissingDataWarningDialog,
    SyncDialogInfo,
    SyncDialogStatus,
  },
})
export default class SyncDialog extends Vue {
  @PropSync('open') syncOpen!: boolean;
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

  icons = {
    mdiClose,
  };

  conflictResolver: ((value: 'local' | 'remote') => void) | null = null;
  missingDataWarningResolver:
    | ((value: 'force' | 'blank' | 'abort') => void)
    | null = null;

  @Watch('syncOpen')
  onOpen(): void {
    if (this.syncOpen) {
      if (this.syncOptions.readingListCollectionId && this.step === 1) {
        this.step = 3;
      }
    }
    if (!this.syncing) {
      this.complete = false;
      this.error = null;
    }
  }

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
</style>