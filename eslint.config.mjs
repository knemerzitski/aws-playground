import globals from 'globals';
import pluginJs from '@eslint/js';
import tsEslint from 'typescript-eslint';
import configPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
  // Ignores
  {
    ignores: ['**/dist', '**/*.config*.{mjs,ts}', '**/.prettierrc.cjs'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.builtin,
    },
  },

  // Javascript
  pluginJs.configs.recommended,

  // Typescript
  ...tsEslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts?(x)'],
  })),
  ...tsEslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts?(x)'],
  })),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  configPrettier,
];
