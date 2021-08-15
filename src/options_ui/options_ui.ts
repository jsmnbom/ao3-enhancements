import Vue from 'vue';

import { NotificationPlugin } from '@/common/plugins/NotificationPlugin';
import { Vuetify, vuetify } from '@/common/plugins/Vuetify';
import { injectDevtoolsIfDevelopmentMode } from '@/common/injectDevtools';

import OptionsUI from './OptionsUI.vue';

injectDevtoolsIfDevelopmentMode();

Vue.use(new NotificationPlugin());
Vue.use(Vuetify);

const appTag = document.createElement('div');
appTag.id = 'app';
document.body.appendChild(appTag);

new Vue({
  vuetify,
  render: (createElement) => createElement(OptionsUI),
}).$mount(appTag);
