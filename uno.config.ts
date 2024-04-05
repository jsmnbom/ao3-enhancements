import { objectMap, objectPick } from '@antfu/utils'
import { parseCssColor, variantGetParameter } from '@unocss/rule-utils'
import { type Preset, type UserShortcuts, type VariantObject, defineConfig, presetAttributify, presetUno, transformerVariantGroup } from 'unocss'
import type { Theme } from 'unocss/preset-uno'
import unocssPresetAnimations from 'unocss-preset-animations'

export const BREAKPOINTS = {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
} satisfies Theme['breakpoints']

const COLOR_NAMES = ['default', 'card', 'popover', 'primary', 'secondary', 'muted', 'accent', 'destructive'] as const

const COLORS = {
  light: {
    'default': '#ffffff',
    'default-fg': '#09090b',
    'card': '#fafafa',
    'card-fg': '#09090b',
    'popover': '#fafafa',
    'popover-fg': '#09090b',
    'primary': '#990000',
    'primary-fg': '#ffffff',
    'secondary': '#f4f4f5',
    'secondary-fg': '#18181b',
    'muted': '#f4f4f5',
    'muted-fg': '#71717a',
    'accent': '#60a5fa',
    'accent-fg': '#18181b',
    'destructive': '#ef4444',
    'destructive-fg': '#fafafa',
    'border': '#e4e4e7',
    'input': '#e4e4e7',
    'ring': '#990000',
  },
  dark: {
    'default': '#09090b',
    'default-fg': '#eeeeee',
    'card': '#09090b',
    'card-fg': '#eeeeee',
    'popover': '#09090b',
    'popover-fg': '#eeeeee',
    'primary': '#990000',
    'primary-fg': '#eeeeee',
    'secondary': '#27272a',
    'secondary-fg': '#eeeeee',
    'muted': '#27272a',
    'muted-fg': '#a1a1aa',
    'accent': '#60a5fa',
    'accent-fg': '#eeeeee',
    'destructive': '#7f1d1d',
    'destructive-fg': '#eeeeee',
    'border': '#27272a',
    'input': '#27272a',
    'ring': '#990000',
  },
} as const

const THEME = {
  breakpoints: BREAKPOINTS,
  container: {
    center: false,
    padding: '0',
    maxWidth: objectPick(BREAKPOINTS, ['sm', 'md']),
  },
  colors: objectMap(COLORS.light, key => ([key, `rgb(var(--color-${key}) / %alpha)`])),
  fontFamily: {
    sans: '"Lucida Grande", "Lucida Sans Unicode", "GNU Unifont", Verdana, Helvetica, sans-serif',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },

  animation: {
    keyframes: {
      'collapsible-down': '{from {height:0} to {height:var(--radix-collapsible-content-height)}}',
      'collapsible-up': '{from {height:var(--radix-collapsible-content-height)} to {height:0}}',
    },
  },
} satisfies Theme

const COLOR_VAR_PREFLIGHT = {
  getCSS: () => Object.entries(COLORS).map(([type, colors]) => `.${type} {${Object.entries(colors).map(([key, value]) => {
    const [r, g, b] = parseCssColor(value)!.components
    return `--color-${key}: ${r} ${g} ${b};\n`
  }).join('')
    } }`).join('\n'),
}

const STATE_VARIANT: VariantObject = {
  name: 'state',
  match(matcher, ctx) {
    const variant = variantGetParameter('state-', matcher, ctx.generator.config.separators)
    if (variant) {
      const [match, rest] = variant
      return {
        matcher: rest,
        selector: s => `${s}[data-state="${match}"]`,
      }
    }
  },
}

const COLOR_SHORTCUTS: UserShortcuts<Theme> = COLOR_NAMES.map(name => [
  [name, `bg-${name} text-${name}-fg`],
  [`on-${name}`, `bg-${name}-fg text-${name}`],
]).flat() as [string, string][]

const ANIMATION_SHORTCUTS: UserShortcuts<Theme> = [
  [/^animate-tooltip$/, () => {
    return [
      'fade-in-0',
      'keyframes-una-in',
      'animate-ease-in',
      'animate-duration-100ms',
      'will-change-opacity',
    ]
  }],
  [/^animate-collapsible$/, () => {
    return [
      'state-open:keyframes-collapsible-down',
      'state-open:animate-ease-out',
      'state-open:animate-duration-300ms',
      'state-closed:keyframes-collapsible-up',
      'state-closed:animate-ease-in',
      'state-closed:animate-duration-300ms',
      'will-change-height',
      'transition-height',
    ]
  }],
  [/^animate-popover$/, () => {
    return [
      'animate-una-in',
      'animate-duration-300ms',
      'fade-in-0',
      'zoom-in-95',

      'state-closed:animate-una-out',
      'state-closed:animate-duration-300ms',
      'state-closed:fade-out-0',
      'state-closed:zoom-out-95',

      'data-[side=bottom]:slide-in-from-top-2',
      'data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2',
      'data-[side=top]:slide-in-from-bottom-2',
    ]
  }],
]

const OTHER_SHORTCUTS: UserShortcuts<Theme> = {
  'button-focus-ring': 'outline-none focus-visible:(ring-ring ring-2 ring-offset-default ring-offset-2)',
}

function presetAnimations(): Preset {
  const { shortcuts, ...rest } = unocssPresetAnimations()
  return rest
}

export default defineConfig({
  shortcuts: [
    ...COLOR_SHORTCUTS,
    ...ANIMATION_SHORTCUTS,
    OTHER_SHORTCUTS,
  ],
  presets: [
    presetUno(),
    presetAttributify({
      strict: false,
    }),
    presetAnimations(),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
  theme: THEME,
  preflights: [COLOR_VAR_PREFLIGHT],
  variants: [STATE_VARIANT],
})
