import { createApp } from 'vue'
import '@unocss/reset/eric-meyer.css'
import './options_ui.css'
import 'uno.css'

import OptionsUI from './components/OptionsUI.vue'

// eslint-disable-next-line ts/no-unsafe-argument
createApp(OptionsUI)
  .mount('#app')
