import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { expect, test } from '../fixtures';

const MINIMAL_BACKUP_PAYLOAD = {
  exportedAt: '2026-01-01T00:00:00.000Z',
  version: 1,
  suppliers: [],
  categories: [],
  products: [],
  arrivals: [],
  departures: [],
  drafts: [],
  recordCodes: [],
  settings: [],
  favorites: [],
  profiles: [],
  backupCheckpoints: [],
  backupHistory: [],
};

function writeTempBackupFile(payload: object): string {
  const filePath = path.join(os.tmpdir(), `test-backup-${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  return filePath;
}

test.describe('backup route smoke', () => {
  test('settings backup route exposes separated backup and checkpoint surfaces', async ({
    page,
  }) => {
    await page.goto('/#/settings/backup');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('banner').getByText('Резервные копии', { exact: true })
    ).toBeVisible();
    await expect(page.getByText('Экспорт и восстановление')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Скачать backup JSON' })
    ).toBeVisible();
    await expect(page.getByLabel('Файл backup')).toBeVisible();
    await expect(page.getByText('Режим восстановления')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Восстановить из backup' })
    ).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Сохранить checkpoint' })
    ).toBeVisible();
    await expect(page.getByText('Журнал backup')).toHaveCount(0);
    await expect(page.getByText('Последние checkpoints')).toHaveCount(0);
    await expect(page.getByText('Операции backup')).toBeVisible();
    await expect(page.getByText('Общий timeline')).toBeVisible();
  });

  test('checkpoint create saves current first-data snapshot as activity only', async ({
    page,
  }) => {
    await page.goto('/#/settings/backup');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Название').fill('Тест-checkpoint');
    await page.getByRole('button', { name: 'Сохранить checkpoint' }).click();

    await expect(page.getByText('Checkpoint создан')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByTestId('backup-activity-timeline')).toBeVisible();
    await expect(
      page.getByTestId('backup-activity-timeline').getByText('Тест-checkpoint')
    ).toBeVisible();
    await expect(page.getByTestId('backup-operations-timeline')).toHaveCount(0);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Скачать backup JSON' }).click();
    await downloadPromise;

    await expect(
      page.getByTestId('backup-operations-timeline').getByText('Экспорт')
    ).toBeVisible();
    await expect(
      page.getByTestId('backup-activity-timeline').getByText('Экспорт')
    ).toBeVisible();
  });

  test('import validation enables restore without writing during validation', async ({
    page,
  }) => {
    await page.goto('/#/settings/backup');
    await page.waitForLoadState('networkidle');

    const backupFile = writeTempBackupFile(MINIMAL_BACKUP_PAYLOAD);

    await page.locator('input[type="file"]').setInputFiles(backupFile);

    await expect(page.getByText('Backup готов к восстановлению')).toBeVisible({
      timeout: 8000,
    });
    await expect(
      page.getByRole('button', { name: 'Восстановить из backup' })
    ).toBeEnabled();
    await expect(page.getByText('Операций backup пока нет.')).toBeVisible();

    fs.unlinkSync(backupFile);
  });

  test('restore commits validated backup and writes backup timeline history', async ({
    page,
  }) => {
    await page.goto('/#/settings/backup');
    await page.waitForLoadState('networkidle');

    const backupFile = writeTempBackupFile(MINIMAL_BACKUP_PAYLOAD);

    await page.locator('input[type="file"]').setInputFiles(backupFile);
    await expect(page.getByText('Backup готов к восстановлению')).toBeVisible({
      timeout: 8000,
    });

    await page.getByRole('button', { name: 'Восстановить из backup' }).click();

    await expect(page.getByText('Восстановление выполнено')).toBeVisible({
      timeout: 8000,
    });
    await expect(
      page.getByTestId('backup-operations-timeline').getByText('Восстановление')
    ).toBeVisible();
    await expect(
      page.getByTestId('backup-activity-timeline').getByText('Восстановление')
    ).toBeVisible();

    fs.unlinkSync(backupFile);
  });

  test('export button triggers JSON download and writes backup-only timeline', async ({
    page,
  }) => {
    await page.goto('/#/settings/backup');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      localStorage.setItem(
        'sklad-buffer',
        JSON.stringify({
          state: { items: [{ id: 'tmp', value: 'TRANSIENT-BUFFER-CODE' }] },
          version: 0,
        })
      );
    });

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Скачать backup JSON' }).click();
    const download = await downloadPromise;
    const filePath = await download.path();

    expect(download.suggestedFilename()).toMatch(/^sklad-backup-v1-/);
    expect(filePath).not.toBeNull();

    const jsonText = fs.readFileSync(filePath as string, 'utf-8');
    expect(jsonText).not.toContain('TRANSIENT-BUFFER-CODE');
    expect(JSON.parse(jsonText)).toMatchObject({
      version: 1,
    });
    await expect(
      page.getByTestId('backup-operations-timeline').getByText('Экспорт')
    ).toBeVisible();
    await expect(
      page.getByTestId('backup-activity-timeline').getByText('Экспорт')
    ).toBeVisible();
  });
});
