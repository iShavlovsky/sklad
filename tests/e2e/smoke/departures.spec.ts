import { expect, test } from '../fixtures';

async function createArrivalFixture(
  page: import('@playwright/test').Page
): Promise<{
  id: string;
  title: string;
}> {
  const title = 'Приход для отгрузки';

  await page.goto('/#/arrivals/create');
  await page.waitForLoadState('networkidle');
  await page.getByRole('textbox').nth(0).fill(title);
  await page.getByRole('textbox').nth(1).fill('2026-04-21T09:15:00Z');
  await page.locator('form').evaluate((formElement) => {
    (formElement as HTMLFormElement).requestSubmit();
  });

  await expect(page).toHaveURL(/#\/arrivals\/([^/]+)\/edit$/);
  const match = page.url().match(/#\/arrivals\/([^/]+)\/edit$/);
  if (!match?.[1]) {
    throw new Error('Не удалось извлечь id созданного прихода');
  }

  return {
    id: match[1],
    title,
  };
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
            id: `buffer-${index + 1}`,
            value,
            normalizedValue: value.toLowerCase(),
            capturedAt: `2026-04-22T08:0${index}:00.000Z`,
            kind: 'qr',
            source: 'scanner-photo',
          })),
        },
        version: 1,
      })
    );
  }, values);
  await page.reload({ waitUntil: 'networkidle' });
}

test.describe('route-first navigation ownership', () => {
  test('departures create, settings subtree and global scanner stay route-owned', async ({
    page,
  }) => {
    await page.goto('/#/departures');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('banner').getByText('Отгрузки', { exact: true })
    ).toBeVisible();
    await page.getByTestId('departures-create-button').click();
    await expect(page).toHaveURL(/#\/departures\/create$/);
    await expect(
      page.getByRole('banner').getByText('Новая отгрузка', { exact: true })
    ).toBeVisible();

    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('banner').getByText('Настройки', { exact: true })
    ).toBeVisible();
    await page.getByRole('link', { name: 'Профиль' }).click();
    await expect(page).toHaveURL(/#\/settings\/profile$/);
    await expect(
      page.getByRole('banner').getByText('Профиль', { exact: true })
    ).toBeVisible();

    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'Резервные копии' }).click();
    await expect(page).toHaveURL(/#\/settings\/backup$/);
    await expect(
      page.getByRole('banner').getByText('Резервные копии', { exact: true })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Сканер' }).click();
    const scannerModal = page.getByRole('dialog', { name: 'Сканер' });
    await expect(scannerModal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(scannerModal).not.toBeVisible({ timeout: 3000 });
  });

  test('departure create flow links arrival and persists basedOnArrivalId', async ({
    page,
  }) => {
    const arrivalFixture = await createArrivalFixture(page);
    await seedBuffer(page, ['DEP-BUF-001']);

    await page.goto('/#/departures');
    await page.waitForLoadState('networkidle');
    await page.reload({ waitUntil: 'networkidle' });

    await page.getByTestId('departures-create-button').click();
    await expect(page).toHaveURL(/#\/departures\/create$/);
    await expect(
      page.getByRole('banner').getByText('Новая отгрузка', { exact: true })
    ).toBeVisible();

    await page.getByRole('button', { name: /Связь с приходом/ }).click();
    await page.getByTestId('departure-linked-arrival-select').click();
    await page.getByRole('option', { name: arrivalFixture.title }).click();
    const linkedArrivalPreview = page.getByTestId(
      'departure-linked-arrival-preview'
    );
    await expect(linkedArrivalPreview).toBeVisible();
    await expect(linkedArrivalPreview).toContainText('Приход для отгрузки');

    await page.getByRole('textbox').nth(0).fill('Отгрузка на выдачу');

    await page.getByTestId('departure-occurred-at-picker').click();
    const timeInputs = page.locator(
      '[data-dates-dropdown="true"] input[role="spinbutton"]'
    );
    await timeInputs.nth(0).fill('10');
    await page
      .getByRole('banner')
      .getByText('Новая отгрузка', { exact: true })
      .click();
    await expect(
      page.getByTestId('departure-occurred-at-picker')
    ).toContainText(/10:\d{2}/);

    await page.getByTestId('departure-open-scanner-button').click();
    const scannerModal = page.getByRole('dialog', { name: 'Сканер' });
    await expect(scannerModal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(scannerModal).not.toBeVisible({ timeout: 3000 });

    await page.getByTestId('departure-open-buffer-picker-button').click();
    const picker = page.getByRole('dialog', { name: 'Буфер' });
    await expect(picker).toBeVisible();
    await picker.getByRole('checkbox', { name: 'DEP-BUF-001' }).click();
    await picker.getByRole('button', { name: 'Применить' }).click();
    await expect(picker).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByText('DEP-BUF-001', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Создать' }).click();

    await expect(page).toHaveURL(/#\/departures$/);
    await expect(page.getByText('Отгрузка создана.')).toBeVisible();
    await expect(
      page.getByRole('banner').getByText('Отгрузки', { exact: true })
    ).toBeVisible();

    const storedDeparture = await page.evaluate(async () => {
      return await new Promise<{
        basedOnArrivalId: string | null;
        title: string;
      } | null>((resolve, reject) => {
        const openRequest = indexedDB.open('sklad-db');

        openRequest.onerror = () => {
          reject(
            openRequest.error ?? new Error('Не удалось открыть IndexedDB')
          );
        };

        openRequest.onsuccess = () => {
          const db = openRequest.result;
          const transaction = db.transaction('departures', 'readonly');
          const store = transaction.objectStore('departures');
          const getAllRequest = store.getAll();

          getAllRequest.onerror = () => {
            reject(
              getAllRequest.error ??
                new Error('Не удалось прочитать departures')
            );
          };

          getAllRequest.onsuccess = () => {
            const match =
              (
                getAllRequest.result as Array<{
                  basedOnArrivalId: string | null;
                  title: string;
                }>
              ).find((item) => item.title === 'Отгрузка на выдачу') ?? null;
            db.close();
            resolve(match);
          };
        };
      });
    });

    expect(storedDeparture).not.toBeNull();
    expect(storedDeparture?.basedOnArrivalId).toBe(arrivalFixture.id);
  });
});
