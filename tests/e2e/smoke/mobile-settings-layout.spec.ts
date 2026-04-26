import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '../fixtures';

const screenshotRoot = path.join(
  process.cwd(),
  '.artifacts',
  'mobile-settings-layout'
);
const expectedSettingsSectionCount = 2;

type SettingsGeometry = {
  mainBottomPaddingPx: number;
  canScrollMain: boolean;
  lastSectionBottomAtBottom: number;
  lastSectionBottomAtWindowBottom: number;
  footerTop: number;
  pageSectionCount: number;
  mainClientHeight: number;
  scrollHeight: number;
  scrolledUsingMain: boolean;
  sectionRects: {
    index: number;
    bottom: number;
  }[];
  hasHeaderActionLabel: boolean;
};

async function openSettings(
  page: import('@playwright/test').Page
): Promise<void> {
  await page.goto('/#/settings');
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('banner').getByText('Настройки', { exact: true })
  ).toBeVisible();
}

test.describe('settings page mobile composition (mobile viewport)', () => {
  test('validates canonical settings composition and screenshots', async ({
    page,
  }) => {
    await openSettings(page);

    const geometry = await page.evaluate((): SettingsGeometry => {
      const sectionLocator = Array.from(
        document.querySelectorAll('.mobile-page-sections .page-section')
      );
      const main = document.querySelector('.mobile-shell__main');
      const footer = document.querySelector('.mobile-shell__footer');
      const lastSection = sectionLocator.at(-1) as HTMLElement | undefined;
      const mainStyles = main ? getComputedStyle(main) : null;
      const toNumber = (value: string): number =>
        Number.parseFloat(value.replace('px', '').trim()) || 0;

      const canScrollMain = Boolean(
        main && main.scrollHeight > main.clientHeight + 1
      );
      let lastSectionBottomAtBottom = 0;
      let lastSectionBottomAtWindowBottom = 0;
      let scrolledUsingMain = false;

      if (main && lastSection) {
        const originalScrollTop = main.scrollTop;
        const originalWindowScrollY = window.scrollY;

        if (canScrollMain) {
          main.scrollTop = main.scrollHeight;
          scrolledUsingMain = true;
          lastSectionBottomAtBottom =
            lastSection.getBoundingClientRect().bottom;
          main.scrollTop = originalScrollTop;
        } else {
          window.scrollTo(0, document.body.scrollHeight);
          scrolledUsingMain = false;
          lastSectionBottomAtWindowBottom =
            lastSection.getBoundingClientRect().bottom;
          window.scrollTo(0, originalWindowScrollY);
        }
      }

      return {
        mainBottomPaddingPx: mainStyles
          ? toNumber(mainStyles.paddingBottom)
          : 0,
        canScrollMain,
        footerTop: footer ? footer.getBoundingClientRect().top : 0,
        mainClientHeight: main ? main.clientHeight : 0,
        lastSectionBottomAtBottom,
        lastSectionBottomAtWindowBottom,
        scrolledUsingMain,
        scrollHeight: main ? main.scrollHeight : 0,
        pageSectionCount: sectionLocator.length,
        sectionRects: sectionLocator.map((node, index) => ({
          index,
          bottom: node.getBoundingClientRect().bottom,
        })),
        hasHeaderActionLabel:
          document.querySelectorAll(
            '.mobile-shell__header button[aria-label], .mobile-shell__header a[aria-label]'
          ).length >= 3,
      };
    });

    await expect(
      page.getByRole('banner').getByText('Настройки', { exact: true })
    ).toBeVisible();
    await expect(page.locator('.mobile-page-sections')).toBeVisible();
    await expect(
      page.locator('.mobile-page-sections .page-section')
    ).toHaveCount(expectedSettingsSectionCount);

    expect(geometry.pageSectionCount).toBe(expectedSettingsSectionCount);
    expect(geometry.hasHeaderActionLabel).toBe(true);
    expect(geometry.mainBottomPaddingPx).toBeGreaterThanOrEqual(0);
    expect(geometry.mainBottomPaddingPx).toBeLessThan(40);

    if (
      geometry.canScrollMain ||
      geometry.scrollHeight > geometry.mainClientHeight
    ) {
      expect(geometry.scrollHeight).toBeGreaterThan(geometry.mainClientHeight);
      const lastBottom = geometry.scrolledUsingMain
        ? geometry.lastSectionBottomAtBottom
        : geometry.lastSectionBottomAtWindowBottom;
      expect(lastBottom).toBeLessThan(geometry.footerTop + 2);
    }

    const topSection = page.getByRole('banner');
    const controlsSection = page
      .locator('.mobile-page-sections .page-section')
      .nth(0);

    fs.mkdirSync(screenshotRoot, { recursive: true });

    await topSection.screenshot({
      path: path.join(screenshotRoot, 'settings-top.png'),
    });
    await controlsSection.screenshot({
      path: path.join(screenshotRoot, 'settings-controls.png'),
    });

    await expect(page.locator('.page-section')).toHaveCount(
      expectedSettingsSectionCount
    );
  });
});
