import { expect, test } from '../fixtures';

const productionRoutes = [
  { path: '/#/', title: 'Главная' },
  { path: '/#/arrivals', title: 'Приходы' },
  { path: '/#/arrivals/create', title: 'Новый приход' },
  { path: '/#/departures', title: 'Расходы' },
  { path: '/#/departures/create', title: 'Новый расход' },
  { path: '/#/drafts', title: 'Черновики' },
  { path: '/#/drafts/create', title: 'Новый черновик' },
  { path: '/#/stocks', title: 'Остатки' },
  { path: '/#/buffer', title: 'Буфер' },
  { path: '/#/settings', title: 'Настройки' },
  { path: '/#/settings/backup', title: 'Резервные копии' },
] as const;

test.describe('route availability and fallback states', () => {
  for (const route of productionRoutes) {
    test(`${route.path} renders shell title and main route content`, async ({
      page,
    }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      await expect(
        page.getByRole('banner').getByText(route.title, { exact: true })
      ).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
    });
  }

  for (const path of ['/#/scanner', '/#/does-not-exist'] as const) {
    test(`${path} falls back to route 404 content`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      await expect(
        page.getByRole('banner').getByText('404', { exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('main').getByText('Маршрут не найден')
      ).toBeVisible();
      await expect(
        page.getByRole('main').getByRole('button', { name: 'На главную' })
      ).toBeVisible();
    });
  }

  test('critical production routes do not emit console errors', async ({
    page,
  }) => {
    const consoleMessages: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        consoleMessages.push(message.text());
      }
    });
    page.on('pageerror', (error) => {
      consoleMessages.push(error.message);
    });

    for (const route of productionRoutes) {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
    }

    expect(consoleMessages).toEqual([]);
  });
});
