module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],

  parserOptions: {
    ecmaVersion: 2020,
  },

  env: {
    node: true,
    webextensions: true,
    es6: true,
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.vue'],

      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json', './tsconfig.webpack.json'],
      },

      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:vue/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'prettier/vue',
        'prettier/@typescript-eslint',
      ],

      rules: {
        indent: 0,
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/member-ordering': 2,
        'import/no-unresolved': 'off',
        'import/named': 'off',
        'import/namespace': 'off',
        'import/default': 'off',
        'import/no-named-as-default-member': 'off',
        'import/order': [
          2,
          {
            'newlines-between': 'always',
            pathGroups: [
              {
                pattern: '@/**',
                group: 'parent',
                position: 'before',
              },
            ],
            pathGroupsExcludedImportTypes: ['builtin'],
          },
        ],
        '@typescript-eslint/indent': 'off',
        'require-await': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-unused-vars': [
          1,
          { argsIgnorePattern: '^_', varsIgnorePattern: '^createElement$' },
        ],
      },

      settings: {
        'import/extensions': ['.js', '.ts', '.tsx', '.vue', '.pug'],
      },
    },
  ],
};
