import { expect, test } from '../fixtures';
import { DEFAULT_SUPPLIER } from '../helpers/constants';

async function createQuantityArrival(
  page: import('@playwright/test').Page,
  productName: string
): Promise<void> {
  await page.goto('/#/arrivals');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /создать|новый/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.getByRole('dialog').getByPlaceholder(/Mavic/i).fill(productName);
  await page.getByPlaceholder('Выберите поставщика').click();
  await page.getByRole('option', { name: DEFAULT_SUPPLIER }).click();
  await page
    .getByRole('dialog')
    .getByText('Количество', { exact: true })
    .click();
  await page.waitForTimeout(200);

  await page
    .getByRole('dialog')
    .getByRole('button', { name: /сохранить/i })
    .click();
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 6000 });
}

async function createSerialArrival(
  page: import('@playwright/test').Page,
  productName: string,
  serial: string
): Promise<void> {
  await page.goto('/#/arrivals');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /создать|новый/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.getByRole('dialog').getByPlaceholder(/Mavic/i).fill(productName);
  await page.getByPlaceholder('Выберите поставщика').click();
  await page.getByRole('option', { name: DEFAULT_SUPPLIER }).click();
  const serialField = page
    .getByRole('dialog')
    .getByPlaceholder('Введите серийный код');
  await serialField.fill(serial);
  await serialField.press('Enter');
  await page.waitForTimeout(300);

  await page
    .getByRole('dialog')
    .getByRole('button', { name: /сохранить/i })
    .click();
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 6000 });
}

test.describe('adjustments', () => {
  test('creates a quantity adjustment', async ({ page }) => {
    await createQuantityArrival(page, 'Тестовая корректировка');

    await page.goto('/#/stocks');
    await page.waitForLoadState('networkidle');

    const cardRow = page
      .locator('.product-card-row')
      .filter({ hasText: 'Тестовая корректировка' });
    await cardRow.getByRole('button', { name: 'Корректировка' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();

    const deltaInput = page
      .getByRole('dialog')
      .getByLabel('Изменение количества');
    await deltaInput.fill('-1');
    await page
      .getByRole('dialog')
      .getByLabel('Причина')
      .fill('Тест корректировки e2e');

    await page
      .getByRole('dialog')
      .getByRole('button', { name: /корректиров/i })
      .click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 6000 });
  });
});

test.describe('serial adjustments', () => {
  test('disables adjustments for serial stock', async ({ page }) => {
    await createSerialArrival(page, 'Серийная позиция', 'SN-ADJ-SER-E2E-001');

    await page.goto('/#/stocks');
    await page.waitForLoadState('networkidle');

    const cardRow = page
      .locator('.product-card-row')
      .filter({ hasText: 'Серийная позиция' });
    const adjustButton = cardRow.getByRole('button', { name: 'Корректировка' });
    await expect(adjustButton).toBeDisabled();
  });
});
