<template lang="pug">
div
  v-row.mx-1.py-2
    v-col
      .d-flex.flex-column
        span.text-subtitle-2.black--text Data import/export
        span.text-subtitle-2.grey--text Approximate storage used: {{ used }}
    v-col(cols='auto')
      v-row.mt-1.mb-0.mx-0
        input(
          type='file',
          ref='importInput',
          accept='application/json',
          style='display: none',
          @change='onImportInputChange'
        )
        v-menu(offset-y)
          template(v-slot:activator='{ on, attrs }')
            v-btn.mx-4(
              v-bind='attrs',
              v-on='on',
              outlined,
              :color='["deep-purple", $vuetify.theme.dark ? "darken-2" : "lighten-2"].join("")'
            ) Export data
          v-list
            v-list-item(two-line, @click='startExport("all")')
              v-list-item-content
                v-list-item-title Export all
                v-list-item-subtitle Recommended if exporting for backup
            v-list-item(two-line, @click='startExport("options")')
              v-list-item-content
                v-list-item-title Export only options
                v-list-item-subtitle Useful for sharing with a friend
            v-list-item(two-line, @click='startExport("cache")')
              v-list-item-content
                v-list-item-title Export only cache
                v-list-item-subtitle Internal data
        v-btn.mx-4(
          outlined,
          :color='["deep-purple", $vuetify.theme.dark ? "darken-2" : "lighten-2"].join("")',
          @click='startImport'
        ) Import data
</template>
<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

import { Options, formatBytes, getOptions, ALL_OPTIONS } from '@/common';

@Component({})
export default class ImportExport extends Vue {
  @PropSync('options', { type: Object }) opts!: Options;

  usedBytes = 0;

  get used(): string {
    return formatBytes(this.usedBytes);
  }

  created(): void {
    void browser.storage.local.get().then((items) => {
      this.usedBytes = JSON.stringify(items).length;
    });
  }

  async startExport(type: 'all' | 'options' | 'cache'): Promise<void> {
    const items = await browser.storage.local.get();
    const filtered =
      type == 'all'
        ? items
        : Object.fromEntries(
            Object.entries(items).filter(([key, _val]) => {
              return key.startsWith(type == 'options' ? 'option.' : 'cache.');
            })
          );
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: 'application/json',
    });
    saveAs(
      blob,
      `AO3-Enhancements_${dayjs().format('YYYY-MM-DD_HH-MM')}_${type}.json`
    );
  }

  startImport(): void {
    const input = this.$refs.importInput as HTMLInputElement;
    input.click();
  }

  onImportInputChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const files = input.files!;
    if (files.length === 0) {
      this.$notification.add('No file to import selected.', 'error');
      return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target!.result! as string;
      const obj = JSON.parse(text) as { [key: string]: unknown };
      void browser.storage.local.set(obj).then(() => {
        void getOptions(ALL_OPTIONS).then((options: Options) => {
          this.$notification.add('Data imported!', 'success');
          this.opts = options;
        });
      });
    };
    reader.readAsText(file);
  }
}
</script>
