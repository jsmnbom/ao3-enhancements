import { objectMap, objectPick } from '@antfu/utils'
import { parseCssColor, variantGetParameter } from '@unocss/rule-utils'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import { type VariantContext, defineConfig, presetAttributify, presetUno } from 'unocss'
import type { Theme } from 'unocss/preset-uno'
import presetAnimations from 'unocss-preset-animations'

export const BREAKPOINTS = {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
} satisfies Theme['breakpoints']

const COLORS = {
  light: {
    'background': '#fafafa',
    'foreground': '#09090b',
    'card': '#fafafa',
    'card-foreground': '#09090b',
    'popover': '#fafafa',
    'popover-foreground': '#09090b',
    'primary': '#990000',
    'primary-foreground': '#ffffff',
    'secondary': '#f4f4f5',
    'secondary-foreground': '#18181b',
    'muted': '#f4f4f5',
    'muted-foreground': '#71717a',
    'accent': '#f4f4f5',
    'accent-foreground': '#18181b',
    'destructive': '#ef4444',
    'destructive-foreground': '#fafafa',
    'border': '#e4e4e7',
    'input': '#e4e4e7',
    'ring': '#990000',
  },
  dark: {
    'background': '#09090b',
    'foreground': '#eeeeee',
    'card': '#09090b',
    'card-foreground': '#eeeeee',
    'popover': '#09090b',
    'popover-foreground': '#eeeeee',
    'primary': '#990000',
    'primary-foreground': '#eeeeee',
    'secondary': '#27272a',
    'secondary-foreground': '#eeeeee',
    'muted': '#27272a',
    'muted-foreground': '#a1a1aa',
    'accent': '#27272a',
    'accent-foreground': '#eeeeee',
    'destructive': '#7f1d1d',
    'destructive-foreground': '#eeeeee',
    'border': '#27272a',
    'input': '#27272a',
    'ring': '#990000',
  },
}

const theme = {
  breakpoints: BREAKPOINTS,
  container: {
    center: false,
    padding: '0',
    maxWidth: objectPick(BREAKPOINTS, ['sm', 'md']),
  },
  colors: objectMap(COLORS.light, key => ([key, `rgb(var(--color-${key}) / %alpha)`])),
} satisfies Theme

const COLOR_VAR_PREFLIGHT = { getCSS: () => Object.entries(COLORS).map(([type, colors]) => `.${type} {${
  Object.entries(colors).map(([key, value]) => {
    const [r, g, b] = parseCssColor(value)!.components
    return `--color-${key}: ${r} ${g} ${b};\n`
  }).join('')
} }`).join('\n') }

export default defineConfig({
  shortcuts: {
    'button-ring': 'focus-visible:(outline-none ring-ring ring-2 ring-offset-background ring-offset-2)',
  },
  presets: [
    presetUno(),
    presetAttributify({
      strict: true,
    }),
    presetAnimations(),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
  theme,
  preflights: [COLOR_VAR_PREFLIGHT],
  variants: [
    {
      name: 'data',
      match(matcher, ctx: VariantContext<Theme>) {
        const variant = variantGetParameter('state=', matcher, ctx.generator.config.separators)
        if (variant) {
          const [match, rest] = variant
          return {
            matcher: rest,
            selector: s => `${s}[data-state="${match}"]`,
          }
        }
      },
    },
  ],
})
