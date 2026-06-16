import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
    env: { NODE_ENV: 'test' },
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    fileParallelism: false,
    // Share one module registry so the mongoose singleton compiles each model
    // exactly once across test files (otherwise: OverwriteModelError).
    isolate: false,
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});
