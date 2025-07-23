import { baseConfig } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: ['eslint.config.js', 'vitest.config.ts'],
  },
  {
    files: ['!**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'vitest',
              message: `Don't use "vitest" in production code`,
            },
          ],
        },
      ],
    },
  },
];
