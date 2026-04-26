import type { Page } from '@playwright/test';

import { expect, test } from '../fixtures';
import { APP_DB_NAME } from '../helpers/constants';

type SeedMovement = {
  amount: number | null;
  codes?: string[];
  id: string;
  kind: 'arrival' | 'departure';
  productName: string;
  title: string;
};

const FIXED_ISO = '2026-04-22T08:00:00.000Z';

async function seedMovements(
  page: Page,
  movements: SeedMovement[]
): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.evaluate(
    async ({ dbName, records, timestamp }) => {
      await new Promise<void>((resolve, reject) => {
        const openRequest = indexedDB.open(dbName);

        openRequest.onerror = () => {
          reject(openRequest.error ?? new Error('Could not open IndexedDB'));
        };

        openRequest.onsuccess = () => {
          const db = openRequest.result;
          const transaction = db.transaction(
            ['arrivals', 'departures', 'products', 'recordCodes', 'suppliers'],
            'readwrite'
          );

          transaction.onerror = () => {
            reject(transaction.error ?? new Error('Seed transaction failed'));
          };

          transaction.oncomplete = () => {
            db.close();
            resolve();
          };

          const arrivals = transaction.objectStore('arrivals');
          const departures = transaction.objectStore('departures');
          const products = transaction.objectStore('products');
          const recordCodes = transaction.objectStore('recordCodes');
          const suppliers = transaction.objectStore('suppliers');

          suppliers.put({
            createdAt: timestamp,
            id: 'supplier-e2e',
            isArchived: false,
            name: 'E2E Supplier',
            normalizedName: 'e2e supplier',
            note: null,
            updatedAt: timestamp,
          });

          for (const record of records) {
            const productId = `product-${record.productName.toLowerCase()}`;

            products.put({
              categoryId: null,
              createdAt: timestamp,
              id: productId,
              isArchived: false,
              name: record.productName,
              normalizedName: record.productName.toLowerCase(),
              note: null,
              supplierId: 'supplier-e2e',
              updatedAt: timestamp,
            });

            const common = {
              amount: record.amount,
              categoryId: null,
              categoryName: null,
              createdAt: timestamp,
              currency: null,
              description: null,
              id: record.id,
              kind: record.kind,
              normalizedCategoryName: null,
              normalizedProductName: record.productName.toLowerCase(),
              normalizedSupplierName: 'e2e supplier',
              normalizedTitle: record.title.toLowerCase(),
              note: null,
              occurredAt: timestamp,
              originDraftId: null,
              originKind: 'manual',
              productId,
              productName: record.productName,
              subjectKind: 'product',
              supplierId: 'supplier-e2e',
              supplierName: 'E2E Supplier',
              title: record.title,
              updatedAt: timestamp,
            };

            if (record.kind === 'arrival') {
              arrivals.put({
                ...common,
                linkUrl: null,
              });
            } else {
              departures.put({
                ...common,
                basedOnArrivalId: null,
                direction: null,
                mode: 'loss',
              });
            }

            for (const [index, value] of (record.codes ?? []).entries()) {
              recordCodes.put({
                createdAt: timestamp,
                id: `${record.id}-code-${index}`,
                kind: 'custom',
                normalizedValue: value.toLowerCase(),
                ownerId: record.id,
                ownerKind: record.kind,
                value,
              });
            }
          }
        };
      });
    },
    { dbName: APP_DB_NAME, records: movements, timestamp: FIXED_ISO }
  );

  await page.reload({ waitUntil: 'networkidle' });
}

async function openStocks(page: Page): Promise<void> {
  await page.goto('/#/stocks');
  await page.waitForLoadState('networkidle');
}

function stockCard(page: Page, title: string) {
  return page.locator('article').filter({ hasText: title });
}

async function expectStockBalance(
  page: Page,
  title: string,
  balance: number
): Promise<void> {
  const card = stockCard(page, title);
  await expect(card).toBeVisible();
  await expect(card).toContainText(`${balance} `);
}

async function openStockDrawer(page: Page, title: string) {
  await stockCard(page, title)
    .getByRole('button', { name: new RegExp(title) })
    .click();
  const drawer = page.getByRole('dialog').filter({ hasText: title });
  await expect(drawer).toBeVisible();
  return drawer;
}

test.describe('stocks coherence route proof', () => {
  test('renders the route empty state on a clean install', async ({ page }) => {
    await openStocks(page);

    await expect(
      page.getByRole('banner').getByText('Остатки', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('main').getByLabel('Список остатков')
    ).toBeVisible();
    await expect(page.locator('article')).toHaveCount(0);
  });

  test('projects arrival and departure quantity movements', async ({
    page,
  }) => {
    await seedMovements(page, [
      {
        amount: 7,
        id: 'arrival-qty',
        kind: 'arrival',
        productName: 'SKU-QTY-PROJECTION',
        title: 'SKU-QTY-PROJECTION',
      },
      {
        amount: 2,
        id: 'departure-qty',
        kind: 'departure',
        productName: 'SKU-QTY-PROJECTION',
        title: 'SKU-QTY-PROJECTION',
      },
    ]);

    await openStocks(page);

    await expectStockBalance(page, 'SKU-QTY-PROJECTION', 5);
  });

  test('opens stock details and shows available serial codes', async ({
    page,
  }) => {
    await seedMovements(page, [
      {
        amount: null,
        codes: ['SN-STOCK-DRAWER-001'],
        id: 'arrival-serial',
        kind: 'arrival',
        productName: 'SKU-SERIAL-DRAWER',
        title: 'SKU-SERIAL-DRAWER',
      },
    ]);

    await openStocks(page);

    await expectStockBalance(page, 'SKU-SERIAL-DRAWER', 1);
    const drawer = await openStockDrawer(page, 'SKU-SERIAL-DRAWER');
    await expect(drawer.getByText('SN-STOCK-DRAWER-001')).toBeVisible();
  });

  test('stock departure action opens create route with prefilled values', async ({
    page,
  }) => {
    await seedMovements(page, [
      {
        amount: 4,
        id: 'arrival-prefill',
        kind: 'arrival',
        productName: 'SKU-PREFILL',
        title: 'SKU-PREFILL',
      },
    ]);

    await openStocks(page);

    const drawer = await openStockDrawer(page, 'SKU-PREFILL');
    await drawer.getByRole('button').nth(1).click();

    await expect(page).toHaveURL(/#\/departures\/create$/);
    await expect(page.getByRole('textbox').first()).toHaveValue('SKU-PREFILL');
    await expect(page.getByRole('textbox').nth(2)).toHaveValue('4');
  });

  test('applies manual quantity adjustment through the stock route dialog', async ({
    page,
  }) => {
    await seedMovements(page, [
      {
        amount: 8,
        id: 'arrival-adjust',
        kind: 'arrival',
        productName: 'SKU-ADJUST',
        title: 'SKU-ADJUST',
      },
    ]);

    await openStocks(page);
    await expectStockBalance(page, 'SKU-ADJUST', 8);

    const drawer = await openStockDrawer(page, 'SKU-ADJUST');
    await drawer.getByRole('button').nth(2).click();

    const dialog = page.locator('[data-modal-content="true"]').filter({
      hasText: 'SKU-ADJUST',
    });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('textbox').first().fill('-3');
    await dialog.getByRole('textbox').nth(1).fill('E2E adjustment');
    await dialog.getByRole('button').last().click();
    await expect(dialog).not.toBeVisible({ timeout: 8000 });

    await expectStockBalance(page, 'SKU-ADJUST', 5);
  });

  test('serial departure removes the available code from stock', async ({
    page,
  }) => {
    await seedMovements(page, [
      {
        amount: null,
        codes: ['SN-STOCK-MOVE-001'],
        id: 'arrival-serial-move',
        kind: 'arrival',
        productName: 'SKU-SERIAL-MOVE',
        title: 'SKU-SERIAL-MOVE',
      },
      {
        amount: null,
        codes: ['SN-STOCK-MOVE-001'],
        id: 'departure-serial-move',
        kind: 'departure',
        productName: 'SKU-SERIAL-MOVE',
        title: 'SKU-SERIAL-MOVE',
      },
    ]);

    await openStocks(page);

    await expectStockBalance(page, 'SKU-SERIAL-MOVE', 0);
    const drawer = await openStockDrawer(page, 'SKU-SERIAL-MOVE');
    await expect(drawer.getByText('SN-STOCK-MOVE-001')).not.toBeVisible();
  });
});
