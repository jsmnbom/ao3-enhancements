import Vue from 'vue';

import { LoggerPlugin, createLogger } from '@/common/logger';
import { NotificationPlugin } from '@/common/plugins/NotificationPlugin';
import { Vuetify, vuetify } from '@/common/plugins/Vuetify';
import { injectDevtoolsIfDevelopmentMode } from '@/common/injectDevtools';

import OptionsUI from './OptionsUI.vue';

injectDevtoolsIfDevelopmentMode();

Vue.use(new LoggerPlugin());
Vue.use(new NotificationPlugin());
Vue.use(Vuetify);

const appTag = document.createElement('div');
appTag.id = 'app';
document.body.appendChild(appTag);

const logger = createLogger('VUE');

new Vue({
  vuetify,
  errorCaptured: (err, _, info) => {
    logger.error(info, err);
    return false;
  },
  render: (createElement) => createElement(OptionsUI),
}).$mount(appTag);
