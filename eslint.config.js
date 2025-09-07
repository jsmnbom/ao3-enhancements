import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: true,
  unocss: {
    overrides: {
      'unocss/order': 'error',
      'unocss/order-attributify': 'error',
    },
  },
  typescript: {
    tsConfigPath: './tsconfig.json',
  },
  vue: {
    overrides: {
      'vue/block-order': ['error', {
        order: ['script', 'template', 'style'],
      }],
      'vue/singleline-html-element-content-newline': ['error', {
        externalIgnores: ['ArchiveLink'],
      }],
    },
  },
  rules: {
    'no-console': 'off',
    'antfu/top-level-function': 'off',
    'node/prefer-global/process': 'off',
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'perfectionist/sort-imports': ['error', {
      groups: [
        'type',
        ['builtin', 'external'],
        'icons',
        'internal-type',
        'internal',
        ['parent-type', 'sibling-type', 'index-type'],
        ['parent', 'sibling', 'index'],
        'side-effect',
        'object',
        'unknown',
      ],
      newlinesBetween: 'always',
      order: 'asc',
      type: 'natural',
      internalPattern: ['^#.+'],
      customGroups: {
        value: {
          icons: ['~icons/.+'],
        },
      },
    }],
  },
  formatters: {
    css: true,
    html: true,
  },
})
