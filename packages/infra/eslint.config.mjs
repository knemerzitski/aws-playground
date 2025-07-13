import globals from 'globals';

import rootConfig from '../../eslint.config.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...rootConfig,
  {
    ignores: ['cdk.dist', 'dist'],
  },
  {
    languageOptions: {
      globals: globals.node,
    },
  },
];
