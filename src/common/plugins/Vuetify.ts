export { default as Vuetify } from 'vuetify/lib/framework';
import Vuetify from 'vuetify/lib/framework';
import colors from 'vuetify/lib/util/colors';

// Use user preferred theme that matches browser
const userPrefersDark =
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

export const vuetify = new Vuetify({
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
