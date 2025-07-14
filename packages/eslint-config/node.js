import globals from 'globals';

import baseConfig from './base.js';

/** @type {import('eslint').Linter.Config[]} */
export const nodeConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: globals.node,
    },
  },
];
