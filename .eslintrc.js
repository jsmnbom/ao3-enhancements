module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier', 'plugin:prettier/recommended'],

  parserOptions: {
    ecmaVersion: 2020,
  },

  env: {
    node: true,
    webextensions: true,
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx'],

      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
      ],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 0,
      },
    },
    {
      files: ['*.vue'],

      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },

      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/vue3-recommended',
        'prettier/@typescript-eslint',
      ],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 0,
      },
    },
  ],
};
