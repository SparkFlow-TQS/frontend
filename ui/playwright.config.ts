import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Test matching - exclude problematic tests that need backend services */
  testIgnore: [
    '**/api-integration.spec.ts',  // Needs station-service backend + different login form
    '**/statistics.spec.ts',       // Needs API endpoints + authentication  
    '**/booking.spec.ts',          // Needs booking service backend
    '**/bookings.spec.ts',         // Our navigation page tests (need auth context)
    '**/history.spec.ts',          // Our navigation page tests (need auth context)
    '**/payments.spec.ts',         // Our navigation page tests (need auth context)
    '**/profile.spec.ts'           // Our navigation page tests (need auth context)
  ],
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Optimize workers for CI vs local */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [['github'], ['html']] : 'html',
  /* Global timeout for entire test suite */
  globalTimeout: process.env.CI ? 600000 : undefined, // 10 minutes max on CI
  /* Test timeout */
  timeout: process.env.CI ? 15000 : 30000,
  /* Expect timeout for assertions */
  expect: {
    timeout: process.env.CI ? 3000 : 5000,
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? 'off' : 'on-first-retry',

    /* Performance optimizations for CI */
    screenshot: process.env.CI ? 'off' : 'only-on-failure',
    video: process.env.CI ? 'off' : 'retain-on-failure',
    
    /* Aggressive timeouts for CI */
    navigationTimeout: process.env.CI ? 8000 : 10000,
    actionTimeout: process.env.CI ? 3000 : 5000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Commented out to speed up testing - uncomment for full browser coverage
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 60 * 1000 : 120 * 1000, // Shorter timeout on CI
    stdout: process.env.CI ? 'pipe' : 'ignore',
    stderr: process.env.CI ? 'pipe' : 'ignore',
  },
});
