import { nodeConfig } from '@repo/eslint-config/node';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nodeConfig,
  {
    ignores: ['cdk.out', 'vitest.config.ts', 'eslint.config.js'],
  },
];
