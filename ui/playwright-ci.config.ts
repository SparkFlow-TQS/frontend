import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration optimized for CI/GitHub Actions
 * This config prioritizes speed and reliability over comprehensive testing
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel but with limitations */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: true,
  /* No retries on CI to fail fast */
  retries: 0,
  /* Limited workers for CI resources */
  workers: 2,
  /* Optimized reporter for GitHub Actions */
  reporter: [['github'], ['html', { outputFolder: 'playwright-report' }]],
  /* Ultra-fast timeout limits for CI */
  globalTimeout: 180000, // 3 minutes total
  timeout: 8000, // 8 seconds per test
  /* Expect timeout for assertions */
  expect: {
    timeout: 1500, // 1.5 seconds for assertions
  },
  
  /* Test matching - only run essential tests */
  testMatch: [
    '**/ci-essential.spec.ts',
    '**/auth.spec.ts'
  ],
  
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Disable all media collection for speed */
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    
    /* Ultra-aggressive timeouts for CI */
    navigationTimeout: 4000,
    actionTimeout: 1500,
    
    /* Disable animations */
    hasTouch: false,
    isMobile: false,
    
    /* Channel optimizations */
    channel: 'chrome', // Use system Chrome if available
  },

  /* Single browser for CI */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Disable heavy features
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-gpu',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--no-sandbox'
          ]
        }
      },
    },
  ],

  /* Optimized dev server for CI */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true, // Reuse existing server to avoid conflicts
    timeout: 30000, // 30 seconds max to start
    stdout: 'pipe',
    stderr: 'pipe',
  },
});