import Vue from 'vue';
import frag from 'vue-frag';

import { NotificationPlugin } from '@/common/plugins/NotificationPlugin';
import { Vuetify, vuetify } from '@/common/plugins/Vuetify';
import { injectDevtoolsIfDevelopmentMode } from '@/common/injectDevtools';

import ReadingList from './ReadingList.vue';

injectDevtoolsIfDevelopmentMode();

Vue.use(new NotificationPlugin());
Vue.use(Vuetify);
Vue.directive('frag', frag);

const appTag = document.createElement('div');
appTag.id = 'app';
document.body.appendChild(appTag);

new Vue({
  vuetify,
  render: (createElement) => createElement(ReadingList),
}).$mount(appTag);
