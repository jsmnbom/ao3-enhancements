import { VueConstructor } from 'vue';
import { Vue, Component } from 'vue-property-decorator';

import { logger } from '../logger';

@Component
export class LoggerPlugin extends Vue {
  install(vue: VueConstructor<Vue>): void {
    vue.mixin({
      created: function (this: Vue) {
        const name = this.$options.name;

        this.$logger = name === undefined ? logger : logger.child(name);
      },
    });
  }
}
