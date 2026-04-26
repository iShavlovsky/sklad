import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '../fixtures';

type StocksGeometry = {
  sectionCount: number;
  h1Count: number;
  pageBottomPadding: number;
  mainRailLeft: number;
  mainRailRight: number;
  headerRailLeft: number;
  headerRailRight: number;
  footerRailLeft: number;
  footerRailRight: number;
  topActionCount: number;
  topActionMinWidth: number;
  topActionMinHeight: number;
  footerTop: number;
  firstSectionBottom: number;
};

const screenshotRoot = path.join(
  process.cwd(),
  '.artifacts',
  'mobile-stocks-layout'
);

async function openStocks(
  page: import('@playwright/test').Page
): Promise<void> {
  await page.goto('/#/stocks');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.mobile-page-header')).toBeVisible();
}

test.describe('stocks page mobile composition (mobile viewport)', () => {
  test('validates canonical mobile stocks composition and captures screenshots', async ({
    page,
  }) => {
    await openStocks(page);

    const geometry = await page.evaluate((): StocksGeometry => {
      const toNumber = (value: string): number =>
        Number.parseFloat(value.replace('px', '').trim()) || 0;

      const sections = Array.from(
        document.querySelectorAll('.mobile-page-sections .page-section')
      ) as HTMLElement[];
      const [firstSection] = sections;
      const main = document.querySelector('.mobile-shell__main');
      const mainStyles = main ? getComputedStyle(main) : null;
      const headerRail = document.querySelector(
        '.mobile-shell__header .mobile-shell__rail'
      );
      const mainRail = document.querySelector(
        '.mobile-shell__main .mobile-shell__rail'
      );
      const footerRail = document.querySelector(
        '.mobile-shell__footer .mobile-shell__rail'
      );
      const footer = document.querySelector('.mobile-shell__footer');
      const topActions = document.querySelectorAll(
        '.mobile-shell__header button[aria-label], .mobile-shell__header a[aria-label]'
      );
      const footerRect = footer ? footer.getBoundingClientRect() : null;
      const topMinWidth = Array.from(topActions)
        .map((item) => item.getBoundingClientRect().width)
        .reduce((min, width) => Math.min(min, width), Number.POSITIVE_INFINITY);
      const topMinHeight = Array.from(topActions)
        .map((item) => item.getBoundingClientRect().height)
        .reduce(
          (min, height) => Math.min(min, height),
          Number.POSITIVE_INFINITY
        );

      return {
        sectionCount: sections.length,
        h1Count: document.querySelectorAll('.mobile-page-header h1').length,
        pageBottomPadding: mainStyles ? toNumber(mainStyles.paddingBottom) : 0,
        mainRailLeft: mainRail ? mainRail.getBoundingClientRect().left : 0,
        mainRailRight: mainRail ? mainRail.getBoundingClientRect().right : 0,
        headerRailLeft: headerRail
          ? headerRail.getBoundingClientRect().left
          : 0,
        headerRailRight: headerRail
          ? headerRail.getBoundingClientRect().right
          : 0,
        footerRailLeft: footerRail
          ? footerRail.getBoundingClientRect().left
          : 0,
        footerRailRight: footerRail
          ? footerRail.getBoundingClientRect().right
          : 0,
        topActionCount: topActions.length,
        topActionMinWidth: Number.isFinite(topMinWidth) ? topMinWidth : 0,
        topActionMinHeight: Number.isFinite(topMinHeight) ? topMinHeight : 0,
        footerTop: footerRect ? footerRect.top : 0,
        firstSectionBottom: firstSection
          ? firstSection.getBoundingClientRect().bottom
          : 0,
      };
    });

    await expect(page.locator('.mobile-page-sections')).toBeVisible();
    await expect(
      page.locator('.mobile-page-sections .page-section')
    ).toHaveCount(1);
    await expect(page.locator('.mobile-page-header h1')).toHaveCount(1);

    expect(geometry.sectionCount).toBe(1);
    expect(geometry.h1Count).toBe(1);
    expect(geometry.topActionCount).toBeGreaterThanOrEqual(3);
    expect(geometry.topActionMinWidth).toBeGreaterThanOrEqual(40);
    expect(geometry.topActionMinHeight).toBeGreaterThanOrEqual(40);
    expect(geometry.pageBottomPadding).toBeGreaterThan(0);
    expect(geometry.pageBottomPadding).toBeLessThan(40);
    expect(geometry.mainRailLeft).toBeCloseTo(geometry.headerRailLeft, 1);
    expect(geometry.mainRailRight).toBeCloseTo(geometry.headerRailRight, 1);
    expect(geometry.mainRailLeft).toBeCloseTo(geometry.footerRailLeft, 1);
    expect(geometry.mainRailRight).toBeCloseTo(geometry.footerRailRight, 1);
    expect(geometry.firstSectionBottom).toBeLessThan(geometry.footerTop);

    fs.mkdirSync(screenshotRoot, { recursive: true });
    await page.locator('.mobile-page-header').screenshot({
      path: path.join(screenshotRoot, 'stocks-top.png'),
    });
    await page.locator('.mobile-page-sections').screenshot({
      path: path.join(screenshotRoot, 'stocks-sections.png'),
    });
    await page.screenshot({
      path: path.join(screenshotRoot, 'stocks-full.png'),
      fullPage: true,
    });
  });
});
