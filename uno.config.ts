import { objectPick } from '@antfu/utils'
import { defineConfig, presetAttributify, presetUno } from 'unocss'
import type { Theme } from 'unocss/preset-uno'

export const breakpoints = {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
} satisfies Theme['breakpoints']

const theme = {
  breakpoints,
  container: {
    center: false,
    padding: '0',
    maxWidth: objectPick(breakpoints, ['sm', 'md', 'lg']),
  },
  colors: {
    ao3: '#900',
  },
} satisfies Theme

export default defineConfig({
  presets: [
    presetUno({
      preflight: false,
    }),
    presetAttributify({
      strict: true,
    }),
  ],
  content: {
    pipeline: {
      include: [
        './src/options_ui/components/**/*.vue',
      ],
    },
  },
  theme,
})
