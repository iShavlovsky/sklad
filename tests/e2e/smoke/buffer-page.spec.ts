import { expect, test } from '../fixtures';

async function seedBuffer(
  page: import('@playwright/test').Page,
  values: string[]
): Promise<void> {
  await page.evaluate((bufferValues: string[]) => {
    localStorage.setItem(
      'sklad-buffer',
      JSON.stringify({
        state: {
          items: bufferValues.map((value, index) => ({
            id: `buffer-${index + 1}`,
            value,
            normalizedValue: value.toLowerCase(),
            capturedAt: `2026-04-21T08:0${index}:00.000Z`,
            kind: index % 2 === 0 ? 'qr' : 'barcode',
            source: index % 2 === 0 ? 'scanner-photo' : 'manual',
          })),
        },
        version: 1,
      })
    );
  }, values);
}

test.describe('buffer page interactions', () => {
  test('edits a buffer item and persists the updated value', async ({
    page,
  }) => {
    await page.goto('/#/buffer');
    await page.waitForLoadState('networkidle');

    await seedBuffer(page, ['BUF-EDIT-001', 'BUF-EDIT-002']);
    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.getByText('BUF-EDIT-001', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Изменить' }).nth(1).click();
    await page.locator('input').last().fill('BUF-EDIT-001-UPDATED');
    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(
      page.getByText('BUF-EDIT-001-UPDATED', { exact: true })
    ).toBeVisible();

    const persistedBuffer = await page.evaluate(() => {
      const rawValue = localStorage.getItem('sklad-buffer');
      return rawValue === null ? null : JSON.parse(rawValue);
    });

    expect(
      persistedBuffer?.state?.items?.map(
        (item: { value: string }) => item.value
      )
    ).toContain('BUF-EDIT-001-UPDATED');
  });

  test('deletes selected items and clears the remaining buffer', async ({
    page,
  }) => {
    await page.goto('/#/buffer');
    await page.waitForLoadState('networkidle');

    await seedBuffer(page, ['BUF-DEL-001', 'BUF-DEL-002', 'BUF-DEL-003']);
    await page.reload({ waitUntil: 'networkidle' });

    await page.getByRole('checkbox', { name: 'BUF-DEL-001' }).click();
    await page.getByRole('checkbox', { name: 'BUF-DEL-002' }).click();
    await page.getByRole('button', { name: 'Удалить выбранное' }).click();
    await page
      .getByRole('dialog', { name: 'Удалить выбранные записи' })
      .getByRole('button', { name: 'Удалить выбранное' })
      .click();

    await expect(
      page.getByText('BUF-DEL-001', { exact: true })
    ).not.toBeVisible();
    await expect(
      page.getByText('BUF-DEL-002', { exact: true })
    ).not.toBeVisible();
    await expect(page.getByText('BUF-DEL-003', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Очистить буфер' }).click();
    await page
      .getByRole('dialog', { name: 'Очистить буфер' })
      .getByRole('button', { name: 'Очистить буфер' })
      .click();

    await expect(page.getByText('Буфер пуст')).toBeVisible();

    const persistedBuffer = await page.evaluate(() => {
      const rawValue = localStorage.getItem('sklad-buffer');
      return rawValue === null ? null : JSON.parse(rawValue);
    });

    expect(persistedBuffer?.state?.items ?? []).toHaveLength(0);
  });
});
