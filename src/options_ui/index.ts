import OptionsPage from './OptionsPage.vue';
import Vue from 'vue';
import vuetify from '@/plugins/vuetify';

if (process.env.NODE_ENV === 'development') {
  const vueDevToolsTag = document.createElement('script');
  vueDevToolsTag.setAttribute('src', 'https://localhost:8099');
  document.body.appendChild(vueDevToolsTag);
}

const appTag = document.createElement('div');
appTag.id = 'app';
document.body.appendChild(appTag);

new Vue({
  vuetify,
  render: (createElement) => createElement(OptionsPage),
}).$mount(appTag);
