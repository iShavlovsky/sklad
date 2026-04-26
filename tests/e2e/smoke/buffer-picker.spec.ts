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
            kind: 'qr',
            source: 'scanner-photo',
          })),
        },
        version: 1,
      })
    );
  }, values);
}

test.describe('буфер-пикер', () => {
  test('копирует коды из общего буфера в форму приходa и не очищает источник', async ({
    page,
  }) => {
    await page.goto('/#/arrivals/create');
    await page.waitForLoadState('networkidle');

    await seedBuffer(page, ['ARR-BUF-001', 'ARR-BUF-002']);
    await page.reload({ waitUntil: 'networkidle' });

    await expect(
      page.getByRole('button', { name: 'Выбрать из буфера' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Выбрать из буфера' }).click();

    const picker = page.getByRole('dialog', { name: 'Буфер' });
    await expect(picker).toBeVisible();
    await expect(picker.getByText('ARR-BUF-001')).toBeVisible();
    await expect(picker.getByText('ARR-BUF-002')).toBeVisible();

    await picker.getByRole('checkbox', { name: 'ARR-BUF-001' }).click();
    await picker.getByRole('checkbox', { name: 'ARR-BUF-002' }).click();
    await picker.getByRole('button', { name: 'Применить' }).click();

    await expect(picker).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByText('ARR-BUF-001', { exact: true })).toBeVisible();
    await expect(page.getByText('ARR-BUF-002', { exact: true })).toBeVisible();
    await expect(
      page
        .locator('.mantine-Notification-root')
        .getByText('Добавлено кодов из буфера: 2.')
    ).toHaveCount(1);

    const persistedBuffer = await page.evaluate(() => {
      const rawValue = localStorage.getItem('sklad-buffer');
      return rawValue === null ? null : JSON.parse(rawValue);
    });

    expect(persistedBuffer?.state?.items).toHaveLength(2);
    expect(
      persistedBuffer?.state?.items?.map(
        (item: { value: string }) => item.value
      )
    ).toEqual(['ARR-BUF-001', 'ARR-BUF-002']);
  });

  test('после закрытия сканера пикер применяет коды, а сканер открывается снова', async ({
    page,
  }) => {
    await page.goto('/#/arrivals/create');
    await page.waitForLoadState('networkidle');

    await seedBuffer(page, ['ARR-CTRL-001', 'ARR-CTRL-002']);
    await page.reload({ waitUntil: 'networkidle' });

    await page.getByRole('button', { name: 'Сканер' }).click();
    const scanner = page.getByRole('dialog', { name: 'Сканер' });
    await expect(scanner).toBeVisible();
    await page.locator('.mantine-Modal-close').click();
    await expect(scanner).toBeHidden();

    await page.getByRole('button', { name: 'Выбрать из буфера' }).click();
    const picker = page.getByRole('dialog', { name: 'Буфер' });
    await expect(picker).toBeVisible();
    await picker.getByRole('checkbox', { name: 'ARR-CTRL-001' }).click();
    await picker.getByRole('button', { name: 'Применить' }).click();
    await expect(picker).not.toBeVisible({ timeout: 3000 });

    await expect(page.getByText('ARR-CTRL-001', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Сканер' }).click();
    await expect(scanner).toBeVisible();
    await page.locator('.mantine-Modal-close').click();
    await expect(scanner).toBeHidden();
  });
});
