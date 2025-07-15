import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'node22',

    sourcemap: true,
    emptyOutDir: true,

    lib: {
      entry: resolve(__dirname, 'src/node/build.ts'),
      formats: ['es'],
    },
  },
});
