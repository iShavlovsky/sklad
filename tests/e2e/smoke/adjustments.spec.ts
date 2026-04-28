import { expect, test } from '../fixtures';

async function openNewArrivalRoute(
  page: import('@playwright/test').Page
): Promise<void> {
  await page.goto('/#/arrivals/create');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/#\/arrivals\/create$/);
  await expect(page.locator('form')).toBeVisible();
}

async function createQuantityArrival(
  page: import('@playwright/test').Page,
  productName: string
): Promise<void> {
  await openNewArrivalRoute(page);
  const form = page.locator('form');
  await form.getByRole('textbox').nth(0).fill(productName);
  await form.getByRole('textbox').nth(2).fill('2');
  await page.locator('form button').last().click();
  await expect(page).toHaveURL(/#\/arrivals\/([^/]+)\/edit$/, {
    timeout: 6000,
  });
}

async function createSerialArrival(
  page: import('@playwright/test').Page,
  productName: string,
  serial: string
): Promise<void> {
  await openNewArrivalRoute(page);
  const form = page.locator('form');
  await form.getByRole('textbox').nth(0).fill(productName);

  const serialField = form.getByRole('textbox').nth(1);
  await serialField.fill(serial);
  await serialField.press('Enter');
  await expect(page.getByText(serial, { exact: true })).toBeVisible();

  await page.locator('form button').last().click();
  await expect(page).toHaveURL(/#\/arrivals\/([^/]+)\/edit$/, {
    timeout: 6000,
  });
}

test.describe('adjustments', () => {
  test('creates a quantity adjustment', async ({ page }) => {
    await createQuantityArrival(page, 'Тестовая корректировка');

    await page.goto('/#/stocks');
    await page.waitForLoadState('networkidle');

    const cardRow = page.locator('article').first();
    await cardRow.getByRole('button').first().click();

    const detailsDialog = page.getByRole('dialog');
    await expect(detailsDialog).toBeVisible();
    await detailsDialog.getByRole('button').nth(2).click();

    const adjustmentDialog = page.getByRole('dialog', {
      name: 'Корректировка остатка',
    });
    await expect(adjustmentDialog).toBeVisible();

    await adjustmentDialog.getByRole('textbox').nth(0).fill('-1');
    await adjustmentDialog
      .getByRole('textbox')
      .nth(1)
      .fill('Тест корректировки e2e');

    await adjustmentDialog.getByRole('button').last().click();
    await expect(adjustmentDialog).not.toBeVisible({ timeout: 6000 });
  });
});

test.describe('serial adjustments', () => {
  test('disables adjustments for serial stock', async ({ page }) => {
    await createSerialArrival(page, 'Серийная позиция', 'SN-ADJ-SER-E2E-001');

    await page.goto('/#/stocks');
    await page.waitForLoadState('networkidle');

    const cardRow = page.locator('article').first();
    await cardRow.getByRole('button').first().click();

    const adjustButton = page.getByRole('dialog').getByRole('button').nth(2);
    await expect(adjustButton).toBeDisabled();
  });
});
