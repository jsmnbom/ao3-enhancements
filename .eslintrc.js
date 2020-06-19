module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],

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
        extraFileExtensions: ['.vue'],
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },

      extends: [
        'plugin:vue/vue3-recommended',
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'prettier/@typescript-eslint',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],

      rules: {
        indent: 0,
        '@typescript-eslint/no-non-null-assertion': 'off',
        'import/no-unresolved': 'off',
        'import/named': 'off',
        'import/namespace': 'off',
        'import/default': 'off',
        'import/no-named-as-default-member': 'off',
        'import/order': 'error',
        '@typescript-eslint/indent': 'off',
        'require-await': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
      },

      settings: {
        'import/extensions': ['.js', '.ts', '.vue', '.pug'],
      },
    },
  ],
};
