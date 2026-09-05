import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100'

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results/artifacts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: './test-results/playwright-report' }],
  ],
  timeout: 30_000,
  expect: {
    timeout: 7_500,
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
    },
  },
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
      },
    },
  ],
  webServer: {
    // DevTools would paint its timing pill over the mobile screenshots.
    command: 'NUXT_DEVTOOLS_ENABLED=false NUXT_HOST=localhost NUXT_PORT=3100 npm run dev',
    url: baseURL,
    // A reused dev server on 3100 keeps its own DevTools setting, so start
    // it with NUXT_DEVTOOLS_ENABLED=false before running the screenshot tests.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
