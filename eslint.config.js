import antfu from '@antfu/eslint-config'
import * as tsResolver from 'eslint-import-resolver-typescript'

export default antfu({
  stylistic: true,
  unocss: {
    overrides: {
      'unocss/order': 'error',
      'unocss/order-attributify': 'error',
    },
  },
  typescript: {
    tsconfigPath: true,
    filesTypeAware: ['**\/*.{ts,tsx}'],
    parserOptions: {
      EXPERIMENTAL_useProjectService: true,
    },
  },
  vue: {
    overrides: {
      'vue/block-order': ['error', {
        order: ['script', 'template', 'style'],
      }],
    },
  },
  settings: {
    'import-x/internal-regex': '^#',
    'import-x/resolver': {
      typescript: {
        mainFields: tsResolver.defaultMainFields,
        extensions: tsResolver.defaultExtensions,
        conditionNames: tsResolver.defaultConditionNames,
        extensionAlias: {},
      },
    },
  },
  rules: {
    // Make debugging nicer
    'eslint-comments/no-unlimited-disable': 'off',
    'no-console': 'off',
    'n/prefer-global/process': ['error', 'always'],
    // Imports
    'import/extensions': ['error', 'always', { ignorePackages: true }],
    'import/order': ['error', {
      'newlines-between': 'always',
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'alphabetize': {
        order: 'asc',
        caseInsensitive: true,
      },
      'pathGroups': [{
        pattern: '~icons/**',
        group: 'external',
        position: 'after',
      }],
    }],

  },
  formatters: {
    css: true,
    html: true,
  },
})
