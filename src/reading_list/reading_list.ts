import Vue from 'vue';

import { VueRouter } from '@/common/vueRouter';
import { createLogger } from '@/common/logger';
import { createVue } from '@/common/createVue';

import ReadingListApp from './ReadingListApp.vue';

const appTag = document.createElement('div');
appTag.id = 'app';
document.body.appendChild(appTag);

const logger = createLogger('VUE/ReadingList');

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/show' },
    {
      path: '/show/:workId?',
      component: () => import('./pages/ReadingListPage.vue'),
      props: true,
      name: 'show',
    },
    {
      path: '/sync',
      component: () => import('./pages/SyncPage.vue'),
      props: true,
    },
  ],
});

createVue(logger, ReadingListApp, { router })
  .then((vue) => vue.$mount(appTag))
  .catch((e) => logger.error(e));
