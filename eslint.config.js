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
        'type-import',
        ['builtin', 'external'],
        'icons',
        'type-internal',
        'internal',
        ['type-parent', 'type-sibling', 'type-index'],
        ['parent', 'sibling', 'index'],
        'side-effect',
        'unknown',
      ],
      newlinesBetween: 1,
      order: 'asc',
      type: 'natural',
      internalPattern: ['^#.+'],
      customGroups: [
        { groupName: 'icons', elementNamePattern: '~icons/.+' },
      ],
    }],
  },
  formatters: {
    css: true,
    html: true,
  },
})
