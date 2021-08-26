import Vue, { CreateElement } from 'vue';
import frag from 'vue-frag';

import { BaseLogger } from '@/common/logger';
import { LoggerPlugin } from '@/common/plugins/LoggerPlugin';
import { NotificationPlugin } from '@/common/plugins/NotificationPlugin';
import { Vuetify, createVuetify } from '@/common/plugins/Vuetify';
import { options } from '@/common/options';
import { injectDevtoolsIfDevelopmentMode } from '@/common/injectDevtools';

injectDevtoolsIfDevelopmentMode();

export async function createVue(
  logger: BaseLogger,
  root: Parameters<CreateElement>[0]
): Promise<Vue> {
  const opts = await options.get([options.IDS.theme]);
  const theme =
    opts.theme.chosen === 'inherit' ? opts.theme.current : opts.theme.chosen;

  Vue.use(new LoggerPlugin());
  Vue.use(new NotificationPlugin());
  Vue.use(Vuetify);
  Vue.directive('frag', frag);

  return new Vue({
    vuetify: createVuetify(theme === 'dark'),
    errorCaptured: (err, _, info) => {
      logger.error(info, err);
      return false;
    },
    render: (createElement) => createElement(root),
  });
}
