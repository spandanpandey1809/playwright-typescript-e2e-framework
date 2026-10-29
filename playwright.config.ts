import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

/**
 * One config, two kinds of tests:
 *  - "api"      runs request-only specs, no browser is launched
 *  - "chromium" runs the browser specs
 * Override the site with BASE_URL=... to point at another environment.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI, // a stray test.only must never silently shrink the CI run
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000 },

  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],

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
  ],
});
