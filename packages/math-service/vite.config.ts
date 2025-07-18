import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  envPrefix: 'SERVICE_',
  build: {
    target: 'node22',
    ssr: true,

    sourcemap: true,
    emptyOutDir: true,

    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },

    rollupOptions: {
      output: {
        entryFileNames: `index.mjs`,
      },
    },
  },
});
