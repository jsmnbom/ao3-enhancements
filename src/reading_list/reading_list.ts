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
    {
      path: '/stats',
      component: () => import('./pages/StatisticsPage.vue'),
      props: true,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      if (to.name === 'show' && to.params.workId && from.name === 'show') {
        return null;
      }
      return { x: 0, y: 0 };
    }
  },
});

createVue(logger, ReadingListApp, { router })
  .then((vue) => vue.$mount(appTag))
  .catch((e) => logger.error(e));
