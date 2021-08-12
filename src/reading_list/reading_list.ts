import Vue from 'vue';
import Vuetify, { colors } from 'vuetify/lib';

import { NotificationPlugin } from '@/options_ui/NotificationPlugin';

import ReadingList from './ReadingList.vue';

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
    options: { customProperties: true },
    themes: {
      dark: {
        primary: '#900',
        secondary: colors.grey.darken3,
        accent: colors.grey.darken3,
        bg: colors.shades.black,
        success: colors.green.darken2,
        error: colors.red.darken2,
        info: colors.blue.darken2,
      },
      light: {
        primary: '#900',
        secondary: colors.grey.darken3,
        accent: colors.grey.darken3,
        bg: colors.shades.white,
        success: colors.green.base,
        error: colors.red.base,
        info: colors.blue.base,
      },
    },
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
  render: (createElement) => createElement(ReadingList),
}).$mount(appTag);
