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
    tsconfigPath: true,
    filesTypeAware: ['**\/*.{ts,tsx}'],
    parserOptions: {
      EXPERIMENTAL_useProjectService: true,
    },
    overrides: {
      // Checked by Typescript
      'ts/no-invalid-this': 'off',
      'ts/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
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
  },
  rules: {
    // Make debugging nicer
    'eslint-comments/no-unlimited-disable': 'off',
    'no-console': 'off',
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
