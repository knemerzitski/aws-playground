import { nodeConfig } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nodeConfig,
  {
    ignores: ['eslint.config.js', 'vitest.config.ts'],
  },
];
