import { defineConfig, devices } from '@playwright/test';

const AUTH_FILE = './playwright/.auth/user.json';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    // Auth setup - runs first to create authenticated state
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Tests that don't require pre-auth (schema, onboarding, mixed auth tests)
    {
      name: 'no-auth-tests',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [
        'schema-verification.spec.ts',
        'onboarding-roles.spec.ts',
        'role-access-control.spec.ts', // Has mixed auth requirements, manages own auth
      ],
    },
    // Tests that require auth - depend on auth-setup
    {
      name: 'auth-tests',
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
      testMatch: [
        'discovery-conversation.spec.ts',
        'hs-student-dashboard.spec.ts',
      ],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
