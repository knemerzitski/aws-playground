import { nodeConfig } from '@repo/eslint-config/node';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nodeConfig,
  {
    ignores: ['eslint.config.js', 'vite.config.ts', 'vitest.config.ts'],
  },
];
