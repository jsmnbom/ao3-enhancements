import { createLogger } from '@/common/logger';
import { createVue } from '@/common/createVue';

import ReadingList from './ReadingList.vue';

const appTag = document.createElement('div');
appTag.id = 'app';
document.body.appendChild(appTag);

const logger = createLogger('VUE/ReadingList');

createVue(logger, ReadingList)
  .then((vue) => vue.$mount(appTag))
  .catch((e) => logger.error(e));
