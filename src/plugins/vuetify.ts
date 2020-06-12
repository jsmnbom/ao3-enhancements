import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

const userPrefersDark =
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

export default new Vuetify({
  theme: {
    dark: userPrefersDark,
  },
  icons: {
    iconfont: 'mdiSvg',
  },
});
