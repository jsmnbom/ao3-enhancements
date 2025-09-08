/* eslint-disable perfectionist/sort-imports */
import './reset.css'
// --- comment to keep ./reset.css loaded first ---

import { createApp } from 'vue'

import { cache, options } from '#common'

import OptionsUI from './OptionsUI.vue'

import 'uno.css'

if (process.env.NODE_ENV === 'development') {
  // Allow manual testing access to the option and cache object
  ;(globalThis as any).options = options
  ;(globalThis as any).cache = cache
}

const app = createApp(OptionsUI)
app.mount('#app')
