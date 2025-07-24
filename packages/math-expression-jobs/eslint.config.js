import { baseConfig } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: ['eslint.config.js', 'vitest.config.ts'],
  },
];
