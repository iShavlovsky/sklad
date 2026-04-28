import { expect, test } from '../fixtures';

function getSerialField(page: import('@playwright/test').Page) {
  return page.getByTestId('serial-codes-input');
}

async function openNewArrivalRoute(
  page: import('@playwright/test').Page
): Promise<void> {
  await page.goto('/#/arrivals/create');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/#\/arrivals\/create$/);
  await expect(
    page.getByRole('banner').getByText('Новый приход', { exact: true })
  ).toBeVisible();
  await expect(page.locator('form')).toBeVisible();
  await expect(getSerialField(page)).toBeVisible();
}

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
            capturedAt: `2026-04-22T08:0${index}:00.000Z`,
            id: `arrival-buffer-${index + 1}`,
            kind: 'custom',
            normalizedValue: value.toLowerCase(),
            source: 'scanner-photo',
            value,
          })),
        },
        version: 1,
      })
    );
  }, values);
  await page.reload({ waitUntil: 'networkidle' });
}

async function fillArrivalForm(
  page: import('@playwright/test').Page,
  title: string,
  serial: string
): Promise<void> {
  await expect(page.locator('form')).toBeVisible();
  await page.getByPlaceholder('Название записи').fill(title);
  const serialField = getSerialField(page);
  await expect(serialField).toBeVisible();
  await serialField.fill(serial);
  await serialField.press('Enter');
  await expect(page.getByText(serial, { exact: true })).toBeVisible();
}

async function createArrivalWithSerial(
  page: import('@playwright/test').Page,
  title: string,
  serial: string
): Promise<string> {
  await openNewArrivalRoute(page);
  await fillArrivalForm(page, title, serial);
  await page.getByRole('button', { name: 'Создать' }).click();
  await expect(page).toHaveURL(/#\/arrivals\/([^/]+)\/edit$/);

  const match = page.url().match(/#\/arrivals\/([^/]+)\/edit$/);
  if (!match?.[1]) {
    throw new Error('Не удалось извлечь id созданного прихода');
  }

  return match[1];
}

test.describe('arrivals route smoke', () => {
  test('creates a unique arrival serial and shows it in the list', async ({
    page,
  }) => {
    await createArrivalWithSerial(page, 'Тестовый приход', 'SN-UNIQUE-E2E-001');

    await page.goto('/#/arrivals');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Тестовый приход')).toBeVisible();
  });

  test('prevents duplicate serial save without leaving create route', async ({
    page,
  }) => {
    await createArrivalWithSerial(page, 'Приход A', 'SN-DUP-E2E-001');

    await openNewArrivalRoute(page);
    await fillArrivalForm(page, 'Приход B', 'SN-DUP-E2E-001');
    await page.getByRole('button', { name: 'Создать' }).click();

    await expect(page).toHaveURL(/#\/arrivals\/create$/);
    await expect(page.getByText('SN-DUP-E2E-001')).toBeVisible();
    await expect(page.getByText(/проверьте заполнение формы/i)).toBeVisible();
  });

  test('cancels arrival route form back to list', async ({ page }) => {
    await openNewArrivalRoute(page);
    await page.getByRole('button', { name: 'Отмена' }).click();
    await expect(page).toHaveURL(/#\/arrivals$/);
    await expect(
      page.getByRole('banner').getByText('Приходы', { exact: true })
    ).toBeVisible();
  });

  test('copy action keeps serial tokens control visible', async ({ page }) => {
    await openNewArrivalRoute(page);
    await expect(page.getByLabel('Серийные коды')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Скопировать серийные коды' })
    ).toBeDisabled();
  });

  test('buffer apply copy-only keeps items in buffer after arrival apply', async ({
    page,
  }) => {
    await page.goto('/#/');
    await seedBuffer(page, ['ARR-BUF-001', 'ARR-BUF-002']);
    await openNewArrivalRoute(page);

    await page.getByRole('button', { name: 'Выбрать из буфера' }).click();
    const bufferDrawer = page.getByRole('dialog', { name: 'Буфер' });
    await expect(bufferDrawer.getByText('ARR-BUF-001')).toBeVisible();
    await expect(bufferDrawer.getByText('ARR-BUF-002')).toBeVisible();

    await bufferDrawer.getByRole('checkbox', { name: 'ARR-BUF-002' }).click();
    await bufferDrawer.getByRole('button', { name: 'Применить' }).click();
    await expect(bufferDrawer).not.toBeVisible({ timeout: 3000 });

    await expect(page.getByText('ARR-BUF-002', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Выбрать из буфера' }).click();
    const reopenedBufferDrawer = page.getByRole('dialog', { name: 'Буфер' });
    await expect(
      reopenedBufferDrawer.getByText('ARR-BUF-001', { exact: true })
    ).toBeVisible();
    await expect(
      reopenedBufferDrawer.getByText('ARR-BUF-002', { exact: true })
    ).toBeVisible();
  });

  test('buffer apply does not show duplicate warning', async ({ page }) => {
    await page.goto('/#/');
    await seedBuffer(page, ['ARR-NODUP-001']);
    await openNewArrivalRoute(page);

    await page.getByRole('button', { name: 'Выбрать из буфера' }).click();
    const bufferDrawer = page.getByRole('dialog', { name: 'Буфер' });
    await bufferDrawer.getByRole('checkbox', { name: 'ARR-NODUP-001' }).click();
    await bufferDrawer.getByRole('button', { name: 'Применить' }).click();
    await expect(bufferDrawer).not.toBeVisible({ timeout: 3000 });

    await expect(
      page.getByText('ARR-NODUP-001', { exact: true })
    ).toBeVisible();
    await expect(page.getByText(/дубликат/i)).toHaveCount(0);
  });

  test('buffer apply sends selected code into serial input', async ({
    page,
  }) => {
    await page.goto('/#/');
    await seedBuffer(page, ['ARR-SEL-001']);
    await openNewArrivalRoute(page);

    await page.getByRole('button', { name: 'Выбрать из буфера' }).click();
    const bufferDrawer = page.getByRole('dialog', { name: 'Буфер' });
    await bufferDrawer.getByRole('checkbox', { name: 'ARR-SEL-001' }).click();
    await bufferDrawer.getByRole('button', { name: 'Применить' }).click();
    await expect(bufferDrawer).not.toBeVisible({ timeout: 3000 });

    await expect(page.getByText('ARR-SEL-001', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Выбрать из буфера' })
    ).toBeVisible();
  });
});
