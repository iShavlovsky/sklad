import type { Page } from '@playwright/test';

import { APP_DB_NAME } from './constants';

/**
 * Delete the app IndexedDB database and clear localStorage, then reload.
 *
 * After reload, Dexie's populate hook runs and seeds the three default suppliers
 * (Default Supplier A, Default Supplier B, Default Supplier C), giving every
 * test a deterministic clean baseline.
 *
 * Call this after navigating to the app origin so the page has access to
 * the correct IndexedDB scope. The current Dexie connection is closed by
 * the reload, which unblocks any pending deleteDatabase request.
 */
export async function resetAppState(page: Page): Promise<void> {
  await page.evaluate((dbName: string) => {
    indexedDB.deleteDatabase(dbName);
    localStorage.clear();
  }, APP_DB_NAME);

  await page.reload({ waitUntil: 'networkidle' });
}
