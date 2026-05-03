import { defineConfig } from '@playwright/test'

const isCI = !!process.env.CI

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.spec\.ts$/,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: isCI ? 'npm run build && npx nuxt preview' : 'npm run dev -- --host',
    url: 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: !isCI,
    env: { NODE_ENV: isCI ? 'production' : 'development' },
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
