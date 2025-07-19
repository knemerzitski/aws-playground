import { defineConfig } from 'vitest/config';

export default defineConfig({
  envPrefix: 'SERVICE_',
  test: {
    include: ['src/**/*.test.ts'],
  },
});
