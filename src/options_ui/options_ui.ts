import './reset.css'
import 'uno.css'

import { createApp } from 'vue'

import { options } from '#common'

import OptionsUI from './OptionsUI.vue'

if (process.env.NODE_ENV === 'development') {
  // Enable Vue devtools - open using `bunx @vue/devtools`
  document.body.appendChild(document.createElement('script')).src = 'http://localhost:8098'

  // Allow manual testing access to the options object
  // eslint-disable-next-line ts/no-unsafe-member-access
  ;(window as any).options = options
}

const app = createApp(OptionsUI)
app.mount('#app')
