import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Directory where test files are located
  fullyParallel: true, // Run tests in parallel
  forbidOnly: !!process.env.CI, // Fail the build on CI if you accidentally left test.only in the source code
  retries: process.env.CI ? 2 : 0, // Retry on CI only
  workers: process.env.CI ? 1 : undefined, // Opt out of parallel tests on CI
  reporter: 'html', // Reporter to use. See https://playwright.dev/docs/test-reporters
  use: {
    baseURL: 'http://localhost:3000', // Base URL to use in actions like `await page.goto('/')`
    trace: 'on-first-retry', // Record trace only when retrying a test
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // You can add more browsers here if needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  // Optional: Set up a web server if your app is not already running
  // webServer: {
  //   command: 'npm run dev', // Command to start your development server
  //   url: 'http://localhost:3000', // URL to wait for before starting tests
  //   reuseExistingServer: !process.env.CI, // Reuse existing server locally
  // },
});
