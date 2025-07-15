import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import turboConfig from 'eslint-config-turbo/flat';

/** @type {import('eslint').Linter.Config[]} */
export const baseConfig = [
  // Global ignores
  {
    ignores: ['dist/**'],
  },

  // JavaScript
  eslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },

  // Typescript
  ...[
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked, //
  ].map((config) => ({
    ...config,
    files: ['**/*.ts?(x)'],
  })),
  {
    files: ['**/*.ts?(x)'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },

  // Turbo
  ...turboConfig,

  // Prettier
  prettier,
];
