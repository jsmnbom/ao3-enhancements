import { NotificationPlugin } from '@/common/NotificationPlugin';

declare module 'vue/types/vue' {
  export interface Vue {
    $notification: NotificationPlugin;
  }
}
