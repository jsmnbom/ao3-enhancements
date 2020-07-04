import Vue from 'vue';

import { NotificationPlugin } from '@/options_ui/NotificationPlugin';

declare module 'vue/types/vue' {
  export interface Vue {
    $notification: NotificationPlugin;
  }
}
