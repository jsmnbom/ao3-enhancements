import { resolve } from 'node:path'

import { objectKeys, objectPick } from '@antfu/utils'
import { parseCssColor, variantGetParameter } from '@unocss/rule-utils'
import * as svgo from 'svgo'
import type { Preset, UserShortcuts, VariantObject } from 'unocss'
import { defineConfig, presetAttributify, presetIcons, presetUno, transformerDirectives, transformerVariantGroup } from 'unocss'
import type { Theme } from 'unocss/preset-uno'
import unocssPresetAnimations from 'unocss-preset-animations'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

export const SVGO_CONFIG = {
  plugins: [{
    name: 'preset-default',
    params: {
      overrides: {
        removeViewBox: false,
        minifyStyles: false,
      },
    },
  },
  ],
} satisfies svgo.Config

export const BREAKPOINTS = {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
} satisfies Theme['breakpoints']

export const COLORS = {
  light: {
    default: ['#ffffff', '#09090b'],
    card: ['#fafafa', '#09090b'],
    popover: ['#fafafa', '#09090b'],
    primary: ['#990000', '#ffffff'],
    secondary: ['#f4f4f5', '#18181b'],
    muted: ['#f4f4f5', '#71717a'],
    accent: ['#60a5fa', '#18181b'],
    destructive: ['#ef4444', '#fafafa'],
    border: '#e4e4e7',
    input: '#e4e4e7',
    ring: '#990000',
  },
  dark: {
    default: ['#09090b', '#eeeeee'],
    card: ['#09090b', '#eeeeee'],
    popover: ['#09090b', '#eeeeee'],
    primary: ['#990000', '#eeeeee'],
    secondary: ['#27272a', '#eeeeee'],
    muted: ['#27272a', '#a1a1aa'],
    accent: ['#60a5fa', '#eeeeee'],
    destructive: ['#7f1d1d', '#eeeeee'],
    border: '#27272a',
    input: '#27272a',
    ring: '#990000',
  },
} as const

export const ICON_COLLECTIONS = {
  ao3e: FileSystemIconLoader(resolve(__dirname, './src/icons')),
}

export const ICON_TRANSFORM = (svg: string) => svgo.optimize(svg, SVGO_CONFIG).data

const THEME_COLOR: Record<string, string> = {}
const COLOR_SHORTCUTS: [string, string][] = []
const COLOR_CSS: Record<keyof typeof COLORS, string[]> = { light: [], dark: [] }

function addColor(name: string, value: { light: string, dark: string }) {
  THEME_COLOR[name] = `rgb(var(--color-${name}) / %alpha)`
  for (const type of objectKeys(COLOR_CSS)) {
    const [r, g, b] = parseCssColor(value[type])!.components
    COLOR_CSS[type].push(`--color-${name}: ${r} ${g} ${b};\n`)
  }
}

for (const name of objectKeys(COLORS.light)) {
  if (Array.isArray(COLORS.light[name])) {
    addColor(name, { light: COLORS.light[name][0], dark: COLORS.dark[name][0] })
    addColor(`${name}-fg`, { light: COLORS.light[name][1], dark: COLORS.dark[name][1] })
    COLOR_SHORTCUTS.push([name, `bg-${name} text-${name}-fg`])
    COLOR_SHORTCUTS.push([`on-${name}`, `bg-${name}-fg text-${name}`])
  }
  else {
    addColor(name, { light: COLORS.light[name] as string, dark: COLORS.dark[name] as string })
  }
}

const THEME = {
  breakpoints: BREAKPOINTS,
  container: {
    center: false,
    padding: '0',
    maxWidth: objectPick(BREAKPOINTS, ['sm', 'md']),
  },
  colors: THEME_COLOR,
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

const ANIMATION_SHORTCUTS: UserShortcuts<Theme> = [
  ['animate-tooltip', [
    ...s('animate-name-una-in animate-duration-100ms animate-ease-in fade-in-0 will-change-opacity '),
  ]],
  ['animate-collapsible', [
    ...s('will-change-height transition-height animate-duration-300ms'),
    ...vg('state-open', 'animate-name-collapsible-down animate-ease-out'),
    ...vg('state-closed', 'animate-name-collapsible-up animate-ease-in'),
  ]],
  ['animate-overlay', [
    ...s('animate-duration-200ms will-change-opacity'),
    ...vg('state-open', 'animate-name-una-in animate-ease-in fade-in-0'),
    ...vg('state-closed', 'animate-name-una-out animate-ease-out fade-out-0'),
  ]],
  ['animate-dialog', [
    ...s('animate-duration-300ms will-change-opacity will-change-transform'),
    ...vg('state-open', 'animate-name-una-in animate-ease-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-48%'),
    ...vg('state-closed', 'animate-name-una-out animate-ease-out fade-out-0 zoom-out-95 slide-out-to-left-1/2 slide-out-to-top-48%'),
  ]],
  ['animate-popover', [
    ...s('animate-name-una-in animate-duration-300ms animate-ease-in fade-in-0 zoom-in-95 will-change-opacity will-change-transform'),
    ...vg('state-closed', 'animate-name-una-out fade-out-0 zoom-out-95'),
    'data-[side=bottom]:slide-in-from-top-2',
    'data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2',
    'data-[side=top]:slide-in-from-bottom-2',
  ]],
]

const OTHER_SHORTCUTS: UserShortcuts<Theme> = {
  'button-focus-ring': 'outline-none focus-visible:(ring-ring ring-2 ring-offset-default ring-offset-2)',
  'link': 'color-inherit underline underline-accent hover:no-underline',
}

function presetAnimations(): Preset {
  const { shortcuts: _, ...rest } = unocssPresetAnimations()
  return rest
}

export default defineConfig({
  shortcuts: [
    ...COLOR_SHORTCUTS,
    ...ANIMATION_SHORTCUTS,
    OTHER_SHORTCUTS,
  ],
  safelist: ['keyframes-una-in', 'keyframes-una-out', 'keyframes-collapsible-down', 'keyframes-collapsible-up'],
  presets: [
    presetUno(),
    presetAttributify({ strict: false }),
    presetAnimations(),
    presetIcons({
      prefix: 'i-',
      collections: ICON_COLLECTIONS,
      customizations: { transform: ICON_TRANSFORM },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup({ separators: [':'] }),
  ],
  theme: THEME,
  preflights: [
    { getCSS: () => Object.entries(COLOR_CSS).map(([type, colors]) => `.${type} {${colors.join('')} }`).join('\n') },
  ],
  variants: [STATE_VARIANT],
})

function s(utilities: string): string[] {
  return utilities.split(' ')
}

function vg(variant: string, utilities: string): string[] {
  return s(utilities).map(utility => `${variant}:${utility}`)
}
