import type { Page } from '@playwright/test';

import { expect, test } from '../fixtures';
import { APP_DB_NAME } from '../helpers/constants';

const FIXED_ISO = '2026-04-22T08:00:00.000Z';

async function seedProduct(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.evaluate(
    async ({ dbName, timestamp }) => {
      await new Promise<void>((resolve, reject) => {
        const openRequest = indexedDB.open(dbName);

        openRequest.onerror = () => {
          reject(openRequest.error ?? new Error('Could not open IndexedDB'));
        };

        openRequest.onsuccess = () => {
          const db = openRequest.result;
          const transaction = db.transaction(
            ['arrivals', 'categories', 'products', 'suppliers'],
            'readwrite'
          );

          transaction.onerror = () => {
            reject(transaction.error ?? new Error('Seed transaction failed'));
          };
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };

          transaction.objectStore('suppliers').put({
            createdAt: timestamp,
            id: 'supplier-products-e2e',
            isArchived: false,
            name: 'E2E Supplier',
            normalizedName: 'e2e supplier',
            note: null,
            updatedAt: timestamp,
          });
          transaction.objectStore('categories').put({
            createdAt: timestamp,
            id: 'category-products-e2e',
            isArchived: false,
            name: 'E2E Category',
            normalizedName: 'e2e category',
            note: null,
            updatedAt: timestamp,
          });
          transaction.objectStore('products').put({
            categoryId: 'category-products-e2e',
            createdAt: timestamp,
            id: 'product-products-e2e',
            isArchived: false,
            name: 'E2E Product Alpha',
            normalizedName: 'e2e product alpha',
            note: 'Initial note',
            supplierId: 'supplier-products-e2e',
            updatedAt: timestamp,
          });
          transaction.objectStore('arrivals').put({
            amount: null,
            categoryId: 'category-products-e2e',
            categoryName: 'E2E Category',
            createdAt: timestamp,
            currency: null,
            description: null,
            id: 'arrival-products-e2e',
            kind: 'arrival',
            linkUrl: null,
            normalizedCategoryName: 'e2e category',
            normalizedProductName: 'e2e product alpha',
            normalizedSupplierName: 'e2e supplier',
            normalizedTitle: 'e2e product alpha',
            note: null,
            occurredAt: timestamp,
            originDraftId: null,
            originKind: 'manual',
            productId: 'product-products-e2e',
            productName: 'E2E Product Alpha',
            quantity: 3,
            subjectKind: 'product',
            supplierId: 'supplier-products-e2e',
            supplierName: 'E2E Supplier',
            title: 'E2E Product Alpha',
            totalCost: 300,
            unitCost: 100,
            updatedAt: timestamp,
          });
        };
      });
    },
    { dbName: APP_DB_NAME, timestamp: FIXED_ISO }
  );

  await page.reload({ waitUntil: 'networkidle' });
}

test.describe('products route', () => {
  test('opens from settings and persists product edits', async ({ page }) => {
    await seedProduct(page);

    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: /Все товары/ }).click();

    await expect(page).toHaveURL(/#\/products$/);
    await expect(
      page.getByRole('banner').getByText('Все товары', { exact: true })
    ).toBeVisible();

    await page.getByPlaceholder('Поиск по названию или заметке').fill('Alpha');
    const productCard = page.locator('article').filter({
      hasText: 'E2E Product Alpha',
    });
    await expect(productCard).toBeVisible();
    await productCard
      .getByRole('button', { name: /Открыть товар E2E Product Alpha/ })
      .click();

    const drawer = page.getByRole('dialog').filter({
      hasText: 'E2E Product Alpha',
    });
    await expect(drawer).toBeVisible();
    await drawer.getByRole('button', { name: 'Редактировать' }).click();

    const editDialog = page.getByRole('dialog', {
      name: 'Редактирование товара',
    });
    await expect(editDialog).toBeVisible();
    await editDialog.getByLabel('Название').fill('E2E Product Beta');
    await editDialog.getByLabel('Заметка').fill('Updated product note');
    await editDialog.getByLabel('Архивный товар').check();
    await editDialog.getByRole('button', { name: 'Сохранить' }).click();
    await expect(editDialog).not.toBeVisible({ timeout: 8000 });

    await page.getByRole('button', { name: 'Фильтр' }).click();
    await page.getByRole('menuitem', { name: 'Архивные' }).click();
    await page.getByPlaceholder('Поиск по названию или заметке').fill('Beta');
    const updatedCard = page.locator('article').filter({
      hasText: 'E2E Product Beta',
    });
    await expect(updatedCard).toBeVisible();
    await expect(updatedCard).toContainText('Архив');
    await expect(updatedCard).toContainText('Updated product note');
  });

  test('opens products from stock drawer cross-link', async ({ page }) => {
    await seedProduct(page);

    await page.goto('/#/stocks');
    await page.waitForLoadState('networkidle');

    const stockCard = page.locator('article').filter({
      hasText: 'E2E Product Alpha',
    });
    await expect(stockCard).toBeVisible();
    await stockCard.getByRole('button', { name: /E2E Product Alpha/ }).click();

    const drawer = page.getByRole('dialog').filter({
      hasText: 'E2E Product Alpha',
    });
    await drawer.getByRole('button', { name: 'Все товары' }).click();

    await expect(page).toHaveURL(/#\/products$/);
    await expect(
      page.locator('article').filter({ hasText: 'E2E Product Alpha' })
    ).toBeVisible();
  });
});
