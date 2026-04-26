import { defineConfig } from '@playwright/test';

import {
  MOBILE_360X800_PROJECT_NAME,
  MOBILE_360X800_VIEWPORT,
} from './tests/e2e/support/mobile-360x800';

/**
 * Server strategy: dev server (vite --host, port 5173).
 *
 * Why dev over preview:
 * - No build step required before running tests.
 * - The app is client-side only with hash routing; dev and preview behave identically.
 * - reuseExistingServer:true means a running dev server is reused with zero extra startup cost.
 * - For CI, always start fresh by setting CI=true.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  // Canonical home for automated Playwright artifacts. Manual MCP/runtime captures
  // should go under .artifacts/manual/<surface>/ instead of the repo root.
  outputDir: '.artifacts/playwright/test-results',
  retries: 1,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: '.artifacts/playwright/report' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    video: 'on-first-retry',
    storageState: 'playwright/.auth/user.json',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: MOBILE_360X800_PROJECT_NAME,
      use: {
        viewport: MOBILE_360X800_VIEWPORT,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
