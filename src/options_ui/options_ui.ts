import { createApp } from 'vue'

import { cache, options } from '#common'

import OptionsUI from './OptionsUI.vue'

import './reset.css'
import 'uno.css'

if (process.env.NODE_ENV === 'development') {
  // Enable Vue devtools - open using `bunx @vue/devtools`
  document.body.appendChild(document.createElement('script')).src = 'http://localhost:8098'

  // Allow manual testing access to the option and cache object
  ;(globalThis as any).options = options
  ;(globalThis as any).cache = cache
}

const app = createApp(OptionsUI)
app.mount('#app')
