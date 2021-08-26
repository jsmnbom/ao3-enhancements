import Vue from 'vue';
import frag from 'vue-frag';

import { NotificationPlugin } from '@/common/plugins/NotificationPlugin';
import { Vuetify, vuetify } from '@/common/plugins/Vuetify';
import { injectDevtoolsIfDevelopmentMode } from '@/common/injectDevtools';
import { createLogger } from '@/common/logger';
import { LoggerPlugin } from '@/common/plugins/LoggerPlugin';

import ReadingList from './ReadingList.vue';

injectDevtoolsIfDevelopmentMode();

Vue.use(new NotificationPlugin());
Vue.use(new LoggerPlugin());
Vue.use(Vuetify);
Vue.directive('frag', frag);

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
  render: (createElement) => createElement(ReadingList),
}).$mount(appTag);
