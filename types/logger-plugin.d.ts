import { BaseLogger } from '@/common/logger';

declare module 'vue/types/vue' {
  export interface Vue {
    $logger: BaseLogger;
  }
}
