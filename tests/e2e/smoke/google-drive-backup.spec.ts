import { expect, test } from '@playwright/test';

import { installGoogleDriveMock } from '../helpers/google-drive-mock';
import { resetAppState } from '../helpers/reset';

async function openWithGoogleMock(
  page: import('@playwright/test').Page,
  options: Parameters<typeof installGoogleDriveMock>[1] = {}
) {
  const state = await installGoogleDriveMock(page, options);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await resetAppState(page);

  return state;
}

async function connectGoogle(page: import('@playwright/test').Page) {
  await page.goto('/#/settings/profile');
  await page.waitForLoadState('networkidle');
  await page.getByTestId('google-connect-button').click();
  await expect(page.getByText('owner@example.com')).toBeVisible({
    timeout: 8000,
  });
}

test.describe('Google Drive backup with mocked Google APIs', () => {
  test('profile connects Google account and persists account metadata after reload', async ({
    page,
  }) => {
    await openWithGoogleMock(page);
    await connectGoogle(page);

    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.getByText('Owner Google')).toBeVisible();
    await expect(page.getByText('owner@example.com')).toBeVisible();
    await expect(page.getByText('Нужно обновить доступ')).toBeVisible();
  });

  test('profile switches to visible folder mode with incremental Drive scope', async ({
    page,
  }) => {
    await openWithGoogleMock(page);
    await connectGoogle(page);

    await page.getByText('Папка в Drive').click();

    await expect(
      page.getByText('Файлы будут видны в папке SKLAD Backups.')
    ).toBeVisible();
  });

  test('offline profile disables Google connect and keeps local backup message', async ({
    page,
    context,
  }) => {
    await openWithGoogleMock(page);
    await page.goto('/#/settings/profile');
    await page.waitForLoadState('networkidle');
    await context.setOffline(true);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await expect(
      page.getByText(
        'Google Drive недоступен офлайн. Локальный backup работает.'
      )
    ).toBeVisible();
    await expect(page.getByTestId('google-connect-button')).toBeDisabled();
  });

  test('backup upload sends canonical JSON to Drive and excludes transient buffer', async ({
    page,
  }) => {
    const state = await openWithGoogleMock(page);
    await connectGoogle(page);

    await page.evaluate(() => {
      localStorage.setItem(
        'sklad-buffer',
        JSON.stringify({
          state: { items: [{ value: 'TRANSIENT-BUFFER-CODE' }] },
        })
      );
    });
    await page.goto('/#/settings/backup');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Сохранить в Drive' }).click();

    await expect(page.getByText('Backup сохранен в Google Drive')).toBeVisible({
      timeout: 8000,
    });
    expect(state.uploadPayloads.join('\n')).toContain('sklad-backup-v1-');
    expect(state.uploadPayloads.join('\n')).toContain('"version":1');
    expect(state.uploadPayloads.join('\n')).not.toContain(
      'TRANSIENT-BUFFER-CODE'
    );
  });

  test('backup lists Drive files and validates downloaded backup before restore', async ({
    page,
  }) => {
    await openWithGoogleMock(page);
    await connectGoogle(page);

    await page.goto('/#/settings/backup');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Обновить список' }).click();

    await expect(page.getByText('sklad-backup-v1-mock.json')).toBeVisible();

    await page.getByRole('button', { name: 'Скачать и проверить' }).click();

    await expect(page.getByText('Backup из Google Drive проверен')).toBeVisible(
      {
        timeout: 8000,
      }
    );
    await expect(
      page.getByRole('button', { name: 'Восстановить из backup' })
    ).toBeEnabled();
  });

  test('invalid Drive JSON shows validation error and keeps restore disabled', async ({
    page,
  }) => {
    await openWithGoogleMock(page, { invalidDownloadJson: true });
    await connectGoogle(page);

    await page.goto('/#/settings/backup');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Обновить список' }).click();
    await page.getByRole('button', { name: 'Скачать и проверить' }).click();

    await expect(
      page.getByText('Backup из Google Drive не проверен')
    ).toBeVisible({ timeout: 8000 });
    await expect(
      page.getByRole('button', { name: 'Восстановить из backup' })
    ).toBeDisabled();
  });

  test('expired token asks to refresh access and does not call Drive upload', async ({
    page,
  }) => {
    const state = await openWithGoogleMock(page, { expiresIn: 30 });
    await connectGoogle(page);

    await page.goto('/#/settings/backup');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByText('Доступ к Google истек. Обновите подключение.')
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Сохранить в Drive' })
    ).toBeDisabled();
    expect(state.uploadPayloads).toEqual([]);
  });
});
