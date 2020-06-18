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
      files: ['*.ts', '*.vue'],

      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },

      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/vue3-recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'prettier/@typescript-eslint',
      ],

      rules: {
        '@typescript-eslint/no-non-null-assertion': 0,
        'import/no-unresolved': 0,
        'import/no-default-export': 0,
        'import/order': 'error',
      },

      settings: {
        'import/extensions': ['.js', '.ts', '.vue', '.pug'],
      },
    },
  ],
};
