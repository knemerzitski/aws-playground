import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    target: 'node22',

    sourcemap: true,
    emptyOutDir: true,

    lib: {
      entry: resolve(__dirname, 'src/handler.ts'),
      formats: ['es'],
    },

    rollupOptions: {
      /**
       * @aws-sdk/* is already bundled in AWS Lambda
       */
      external: ['@aws-sdk/*'],
      output: {
        entryFileNames: `index.mjs`,
      },
    },
  },
  plugins: [],
});
