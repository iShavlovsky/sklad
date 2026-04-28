import { expect, test } from '../fixtures';

async function expectCreateButtonFillsRemainingFooterWidth(
  page: import('@playwright/test').Page,
  route: string,
  footerTestId: string,
  buttonLocator: import('@playwright/test').Locator
): Promise<void> {
  await page.goto(route);
  await page.waitForLoadState('networkidle');

  await expect(buttonLocator).toBeVisible();

  const geometry = await buttonLocator.evaluate((button, testId) => {
    const pageSection = button.closest('.page-section');
    const footerRow = document.querySelector(`[data-testid="${testId}"]`);
    const counter = footerRow?.firstElementChild;
    const buttonRect = button.getBoundingClientRect();
    const sectionRect = pageSection?.getBoundingClientRect();
    const rowRect = footerRow?.getBoundingClientRect();
    const counterRect = counter?.getBoundingClientRect();

    return {
      buttonLeft: buttonRect.left,
      buttonRight: buttonRect.right,
      buttonWidth: buttonRect.width,
      bottomGap: (sectionRect?.bottom ?? 0) - buttonRect.bottom,
      counterRight: counterRect?.right ?? 0,
      rowRight: rowRect?.right ?? 0,
      rowWidth: rowRect?.width ?? 0,
      sameRow:
        counterRect !== undefined &&
        Math.abs(
          buttonRect.top +
            buttonRect.height / 2 -
            (counterRect.top + counterRect.height / 2)
        ) < 8,
    };
  }, footerTestId);

  expect(geometry.rowWidth).toBeGreaterThan(0);
  expect(geometry.sameRow).toBe(true);
  expect(geometry.buttonLeft).toBeGreaterThanOrEqual(geometry.counterRight);
  expect(geometry.buttonRight).toBeGreaterThanOrEqual(geometry.rowRight - 2);
  expect(geometry.buttonWidth).toBeGreaterThan(geometry.rowWidth * 0.35);
  expect(geometry.bottomGap).toBeLessThanOrEqual(10);
}

test.describe('Agent E approved UI contracts', () => {
  test('settings hub keeps the compact two-section shape with info popovers', async ({
    page,
  }) => {
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('.mobile-shell__title').getByText('Настройки', {
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.locator('.mobile-page-sections .page-section')
    ).toHaveCount(2);
    await expect(
      page.getByTestId('settings-theme-preference-select')
    ).toBeVisible();
    await expect(page.getByTestId('settings-nav-profile')).toBeVisible();
    await expect(page.getByTestId('settings-nav-backup')).toBeVisible();
    await expect(page.getByTestId('settings-nav-about')).toBeVisible();

    const infoButtons = page.getByRole('button', {
      name: /Как это работает|О разделе/,
    });
    await expect(infoButtons).toHaveCount(2);

    await infoButtons.first().click();
    await expect(
      page.locator('.mantine-Popover-dropdown:visible').first()
    ).toBeVisible();
  });

  test('settings backup exposes info buttons and separated timelines', async ({
    page,
  }) => {
    await page.goto('/#/settings/backup');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Операций backup пока нет.')).toBeVisible();
    await expect(
      page.getByText('Общая история backup и checkpoint пока пуста.')
    ).toBeVisible();

    const infoButtons = page.getByRole('button', { name: 'О разделе' });
    await expect(infoButtons).toHaveCount(3);

    await infoButtons.first().click();
    await expect(
      page
        .getByText(
          /Checkpoint сохраняет|операции backup|Общая история объединяет/
        )
        .first()
    ).toBeVisible();

    await page.getByRole('button', { name: /checkpoint/i }).click();
    await expect(page.getByText('Checkpoint создан')).toBeVisible();
    await expect(page.getByTestId('backup-activity-timeline')).toBeVisible();
    await expect(
      page
        .getByTestId('backup-activity-timeline')
        .locator('.mantine-Timeline-item')
    ).toHaveCount(1);
    await expect(
      page.getByText('Точка восстановления из текущего backup payload.')
    ).toBeVisible();
    await expect(page.getByTestId('backup-operations-timeline')).toHaveCount(0);
  });

  test('arrival and departure list create buttons use the full available row width', async ({
    page,
  }) => {
    await expectCreateButtonFillsRemainingFooterWidth(
      page,
      '/#/arrivals',
      'arrivals-list-footer',
      page.getByTestId('arrivals-create-button')
    );
    await expectCreateButtonFillsRemainingFooterWidth(
      page,
      '/#/departures',
      'departures-list-footer',
      page.getByTestId('departures-create-button')
    );
  });

  test('collection filters render type choices in the first menu level', async ({
    page,
  }) => {
    await page.goto('/#/arrivals');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /Фильтры/ }).click();

    await expect(page.locator('.mantine-Menu-dropdown').first()).toBeVisible();
    await expect(page.locator('.mantine-Menu-subDropdown')).toHaveCount(0);
    await expect(
      page.getByRole('menuitem', { name: /Все типы/ })
    ).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /Товар/ })).toBeVisible();
  });

  test('ui-kit is a full-page dev surface with its own scroll contract', async ({
    page,
  }) => {
    await page.goto('/#/ui-kit');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('ui-kit-section-a')).toBeVisible();
    await expect(page.locator('.full-page-container')).toBeVisible();
    await expect(page.locator('.mobile-page-container')).toHaveCount(0);
    await expect(page.locator('.mobile-shell__header')).toHaveCount(0);
    await expect(page.locator('.mobile-shell__footer')).toHaveCount(0);

    const scrollContract = await page.evaluate(() => {
      const shellMain = document.querySelector('.mobile-shell__main');
      const fullPageContainer = document.querySelector('.full-page-container');

      return {
        canScroll:
          document.documentElement.scrollHeight >
            document.documentElement.clientHeight + 1 ||
          document.body.scrollHeight > document.body.clientHeight + 1 ||
          Boolean(
            fullPageContainer &&
            fullPageContainer.scrollHeight > fullPageContainer.clientHeight + 1
          ),
        shellMainExists: Boolean(shellMain),
      };
    });

    expect(scrollContract.canScroll).toBe(true);
    expect(scrollContract.shellMainExists).toBe(false);
  });

  test('device-preview and ui-kit expose stable cross-links', async ({
    page,
  }) => {
    await page.goto('/#/ui-kit');
    await page.waitForLoadState('networkidle');

    const devicePreviewLink = page.getByRole('link', {
      name: 'Device Preview',
    });
    await expect(devicePreviewLink).toHaveAttribute(
      'href',
      '/#/device-preview?target=/ui-kit'
    );

    await devicePreviewLink.click();
    await expect(page).toHaveURL(/#\/device-preview\?target=\/ui-kit$/);
    await expect(page.getByTestId('device-preview-iframe')).toHaveAttribute(
      'src',
      '/#/ui-kit'
    );

    const uiKitLink = page.getByRole('link', { name: 'UI Kit' });
    await expect(uiKitLink).toHaveAttribute('href', '/#/ui-kit');

    await uiKitLink.click();
    await expect(page).toHaveURL(/#\/ui-kit$/);
  });
});
