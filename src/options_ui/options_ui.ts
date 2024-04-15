import './reset.css'
import 'uno.css'

import { createApp } from 'vue'

import { options } from '#common'

import OptionsUI from './OptionsUI.vue'

if (process.env.NODE_ENV === 'development') {
  // Enable Vue devtools
  // const { devtools } = await import('@vue/devtools')
  // await devtools.connect()

  // Allow manual testing access to the options object
  // eslint-disable-next-line ts/no-unsafe-member-access
  ;(window as any).options = options
}

createApp(OptionsUI)
  .mount('#app')
