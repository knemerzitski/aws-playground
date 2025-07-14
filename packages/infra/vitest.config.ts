import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  envDir: '../../',
  test: {
    include: ['__tests__/**/*.test.ts'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    watch: true,
  },
});
