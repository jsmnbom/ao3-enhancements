import { createLogger } from '@/common/logger';
import { createVue } from '@/common/createVue';

import OptionsUI from './OptionsUI.vue';

const appTag = document.createElement('div');
appTag.id = 'app';
document.body.appendChild(appTag);

const logger = createLogger('VUE/OptionsUI');

createVue(logger, OptionsUI)
  .then((vue) => vue.$mount(appTag))
  .catch((e) => logger.error(e));
