import './reset.css'
import 'uno.css'

import { createApp } from 'vue'

import OptionsUI from './OptionsUI.vue'

// if (process.env.NODE_ENV === 'development') {
//   const { devtools } = await import('@vue/devtools')
//   await devtools.connect()
// }

createApp(OptionsUI)
  .mount('#app')
