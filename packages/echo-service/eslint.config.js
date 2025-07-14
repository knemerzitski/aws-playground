import { nodeConfig } from '@repo/eslint-config/node';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nodeConfig,
  {
    ignores: ['vite.config.ts', 'vitest.config.ts', 'eslint.config.js'],
  },
];
