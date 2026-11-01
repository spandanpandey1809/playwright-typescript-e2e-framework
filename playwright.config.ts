import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

/** Tests tagged @smoke also run on the extra browsers and the phone viewport. */
const SMOKE = /@smoke/;

/**
 * Projects:
 *  - api            request-only specs, no browser
 *  - chromium       every browser spec
 *  - firefox, webkit, mobile-chrome, mobile-safari
 *                   the @smoke subset, to catch browser and layout issues
 *                   without multiplying the whole suite (and the load on a
 *                   public demo site) by five
 * Override the site with BASE_URL=... to point at another environment.
 */
export default defineConfig({
  testDir: './tests',
  globalSetup: './src/global-setup.ts',
  fullyParallel: true,
  forbidOnly: isCI, // a stray test.only must never silently shrink the CI run
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000 },

  // In CI each shard writes a blob report; the workflow merges them into one HTML report
  reporter: isCI ? [['list'], ['blob']] : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://automationexercise.com',
    // The site marks its forms with data-qa attributes, so getByTestId() uses them
    testIdAttribute: 'data-qa',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
    },
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      grep: SMOKE,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      grep: SMOKE,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      testDir: './tests/ui',
      grep: SMOKE,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      testDir: './tests/ui',
      grep: SMOKE,
      use: { ...devices['iPhone 14'] },
    },
  ],
});
