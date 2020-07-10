import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

import OptionsUI from './OptionsUI.vue';
import { NotificationPlugin } from './NotificationPlugin';

/* Load vue-devtools through https reverse proxy proxy */
if (process.env.NODE_ENV === 'development') {
  const vueDevToolsTag = document.createElement('script');
  vueDevToolsTag.setAttribute('src', 'https://localhost:8099');
  document.body.appendChild(vueDevToolsTag);
}

/* load our notification plugin */
Vue.use(new NotificationPlugin());

/* Set up Vuetify */
Vue.use(Vuetify);

// Use user preferred theme that matches browser
const userPrefersDark =
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const vuetify = new Vuetify({
  theme: {
    dark: userPrefersDark,
  },
  icons: {
    iconfont: 'mdiSvg',
  },
});

/* Set up Vue */
const appTag = document.createElement('div');
appTag.id = 'app';
document.body.appendChild(appTag);

new Vue({
  vuetify,
  render: (createElement) => createElement(OptionsUI),
}).$mount(appTag);
