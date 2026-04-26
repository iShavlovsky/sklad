import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '../fixtures';
import { MOBILE_360X800_VIEWPORT } from '../support/mobile-360x800';

const screenshotRoot = path.join(
  process.cwd(),
  '.artifacts',
  'theme-screenshots'
);

type ThemeMode = 'light' | 'dark';

const themeModes: Array<{
  expectedLabel: string;
  filePrefix: ThemeMode;
  mode: ThemeMode;
  optionIndex: number;
}> = [
  {
    expectedLabel: 'Светлая',
    filePrefix: 'light',
    mode: 'light',
    optionIndex: 0,
  },
  {
    expectedLabel: 'Тёмная',
    filePrefix: 'dark',
    mode: 'dark',
    optionIndex: 1,
  },
];

async function capture(
  page: import('@playwright/test').Page,
  filename: string
): Promise<void> {
  await page.screenshot({
    path: path.join(screenshotRoot, filename),
    fullPage: true,
  });
}

async function openRoute(
  page: import('@playwright/test').Page,
  route: `/${string}`
): Promise<void> {
  await page.goto(`/#${route}`);
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(
    new RegExp(`#${route.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&')}`)
  );
}

async function setThemeMode(
  page: import('@playwright/test').Page,
  optionIndex: number
): Promise<void> {
  const select = page.getByTestId('settings-theme-preference-select');
  await select.waitFor({ state: 'visible', timeout: 10_000 });
  await select.click({ force: true });

  const option = page.getByRole('option').nth(optionIndex);
  await expect(option).toBeVisible({ timeout: 5000 });
  await option.click({ force: true });
}

test.describe('theme foundation modes', () => {
  test('captures app routes and supported light dark modes', async ({
    page,
  }) => {
    fs.mkdirSync(screenshotRoot, { recursive: true });
    await page.setViewportSize(MOBILE_360X800_VIEWPORT);

    await openRoute(page, '/settings');
    await expect(
      page.getByRole('heading', { name: 'Настройки' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Сканер' })).toBeVisible();

    await page.getByRole('button', { name: 'Сканер' }).click();
    const scannerModal = page.getByRole('dialog').first();
    await expect(scannerModal).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(scannerModal).not.toBeVisible({ timeout: 5000 });

    for (const themeMode of themeModes) {
      await openRoute(page, '/settings');
      await setThemeMode(page, themeMode.optionIndex);
      await expect(
        page.getByTestId('settings-theme-preference-select')
      ).toHaveValue(themeMode.expectedLabel);
      await expect(
        page.locator(
          '[data-testid="settings-light-theme-preset-select"], [data-testid="settings-dark-theme-preset-select"]'
        )
      ).toHaveCount(0);
      await capture(page, `${themeMode.filePrefix}-settings.png`);

      for (const route of [
        '/',
        '/arrivals',
        '/departures',
        '/buffer',
      ] as const) {
        await openRoute(page, route);
        await expect(
          page.locator('.mobile-shell__main-panel').first()
        ).toBeVisible();
        await capture(
          page,
          `${themeMode.filePrefix}-${route === '/' ? 'root' : route.slice(1)}.png`
        );
      }
    }
  });
});
