<template lang="pug">
div
  span Approximate storage used:
    |
    |
    | {{used}}
  v-row.mt-2
    input(type="file" ref='importInput' accept="application/json" style="display:none", @change='onImportInputChange')
    v-menu(offset-y)
      template(v-slot:activator='{ on, attrs }')
        v-btn(v-bind='attrs', v-on='on', outlined, :class='["deep-purple", $vuetify.theme.dark ? "darken-2" : "lighten-2"]').mx-4 Export data
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
            v-list-item-subtitle Internal data like which works has been checked for kudos
    v-btn.mx-4(outlined, :class='["deep-purple", $vuetify.theme.dark ? "darken-2" : "lighten-2"]', @click='startImport') Import data 
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
