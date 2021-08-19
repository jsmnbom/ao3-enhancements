import { NotificationPlugin } from '@/common/plugins/NotificationPlugin';

declare module 'vue/types/vue' {
  export interface Vue {
    $notification: NotificationPlugin;
  }
}
