import { expect, test as base } from '@playwright/test';

import { resetAppState } from '../helpers/reset';

type AutoFixtures = { _reset: undefined };

/**
 * Extended test fixture with automatic per-test state reset.
 *
 * Before each test the fixture:
 * 1. Navigates to the app root.
 * 2. Deletes IndexedDB and clears localStorage.
 * 3. Reloads — Dexie populate hook seeds default suppliers.
 *
 * Every test starts from a clean, deterministic state with 3 default suppliers.
 */
export const test = base.extend<AutoFixtures>({
  _reset: [
    async ({ page }, use) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await resetAppState(page);
      await use(undefined);
    },
    { auto: true },
  ],
});

export { expect };
