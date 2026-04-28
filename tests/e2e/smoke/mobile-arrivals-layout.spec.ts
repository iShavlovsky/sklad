import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '../fixtures';

const screenshotRoot = path.join(
  process.cwd(),
  '.artifacts',
  'mobile-arrivals-layout'
);

type ArrivalsGeometry = {
  h1Count: number;
  sectionCount: number;
  footerCreateButtonCount: number;
  topActionMinWidth: number;
  topActionMinHeight: number;
  headerRailLeft: number;
  headerRailRight: number;
  mainRailLeft: number;
  mainRailRight: number;
  footerRailLeft: number;
  footerRailRight: number;
  routeTop: number;
  firstSectionBottom: number;
  footerTop: number;
  mainTopPaddingPx: number;
  routeContentTop: number;
};

async function openArrivals(
  page: import('@playwright/test').Page
): Promise<void> {
  await page.goto('/#/arrivals');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.mobile-shell__title')).toBeVisible();
}

test.describe('arrivals list page mobile composition (mobile viewport)', () => {
  test('validates canonical arrivals composition and captures screenshots', async ({
    page,
  }) => {
    await openArrivals(page);

    const geometry = await page.evaluate((): ArrivalsGeometry => {
      const main = document.querySelector('.mobile-shell__main');
      const header = document.querySelector('.mobile-shell__header');
      const footer = document.querySelector('.mobile-shell__footer');
      const headerRail = document.querySelector(
        '.mobile-shell__header .mobile-shell__rail'
      );
      const mainRail = document.querySelector(
        '.mobile-shell__main .mobile-shell__rail'
      );
      const footerRail = document.querySelector(
        '.mobile-shell__footer .mobile-shell__rail'
      );
      const topActions = document.querySelectorAll(
        '.mobile-shell__header button[aria-label]'
      );
      const footerCreateButtons = document.querySelectorAll(
        '.mobile-page-sections button'
      );
      const sections = Array.from(
        document.querySelectorAll('.mobile-page-sections .page-section')
      ) as HTMLElement[];
      const [firstSection] = sections;
      const routeContent = document.querySelector('.mobile-page-container');
      const routeContentRect = routeContent?.getBoundingClientRect();

      const topMinWidth = Array.from(topActions).reduce(
        (min, node) => Math.min(min, node.getBoundingClientRect().width),
        Number.POSITIVE_INFINITY
      );
      const topMinHeight = Array.from(topActions).reduce(
        (min, node) => Math.min(min, node.getBoundingClientRect().height),
        Number.POSITIVE_INFINITY
      );

      return {
        h1Count: document.querySelectorAll('.mobile-shell__title').length,
        sectionCount: sections.length,
        footerCreateButtonCount: footerCreateButtons.length,
        topActionMinWidth: Number.isFinite(topMinWidth) ? topMinWidth : 0,
        topActionMinHeight: Number.isFinite(topMinHeight) ? topMinHeight : 0,
        headerRailLeft: headerRail
          ? headerRail.getBoundingClientRect().left
          : 0,
        headerRailRight: headerRail
          ? headerRail.getBoundingClientRect().right
          : 0,
        mainRailLeft: mainRail ? mainRail.getBoundingClientRect().left : 0,
        mainRailRight: mainRail ? mainRail.getBoundingClientRect().right : 0,
        footerRailLeft: footerRail
          ? footerRail.getBoundingClientRect().left
          : 0,
        footerRailRight: footerRail
          ? footerRail.getBoundingClientRect().right
          : 0,
        routeTop: header?.getBoundingClientRect().bottom || 0,
        firstSectionBottom: firstSection
          ? firstSection.getBoundingClientRect().bottom
          : 0,
        footerTop: footer?.getBoundingClientRect().top || 0,
        mainTopPaddingPx: main
          ? parseFloat(getComputedStyle(main).paddingTop) || 0
          : 0,
        routeContentTop: routeContentRect ? routeContentRect.top : 0,
      };
    });

    await expect(page.locator('.mobile-page-sections')).toBeVisible();
    await expect(
      page.locator('.mobile-page-sections .page-section')
    ).toHaveCount(1);
    await expect(page.locator('.mobile-shell__title')).toHaveCount(1);

    expect(geometry.h1Count).toBe(1);
    expect(geometry.sectionCount).toBe(1);
    expect(geometry.footerCreateButtonCount).toBeGreaterThanOrEqual(1);
    expect(geometry.topActionMinWidth).toBeGreaterThanOrEqual(40);
    expect(geometry.topActionMinHeight).toBeGreaterThanOrEqual(40);
    expect(geometry.routeTop).toBeLessThanOrEqual(geometry.routeContentTop);
    expect(geometry.firstSectionBottom).toBeLessThanOrEqual(geometry.footerTop);
    expect(geometry.mainTopPaddingPx).toBeGreaterThanOrEqual(0);
    expect(geometry.mainTopPaddingPx).toBeLessThan(40);
    expect(geometry.headerRailLeft).toBeCloseTo(geometry.mainRailLeft, 1);
    expect(geometry.headerRailRight).toBeCloseTo(geometry.mainRailRight, 1);
    expect(geometry.footerRailLeft).toBeCloseTo(geometry.mainRailLeft, 1);
    expect(geometry.footerRailRight).toBeCloseTo(geometry.mainRailRight, 1);

    fs.mkdirSync(screenshotRoot, { recursive: true });
    await page.locator('.mobile-shell__header').screenshot({
      path: path.join(screenshotRoot, 'arrivals-top.png'),
    });
    await page.locator('.mobile-page-sections').screenshot({
      path: path.join(screenshotRoot, 'arrivals-list-area.png'),
    });
    await page.screenshot({
      path: path.join(screenshotRoot, 'arrivals-full.png'),
      fullPage: true,
    });
  });

  test('validates arrivals details and not-found surfaces', async ({
    page,
  }) => {
    await page.goto('/#/arrivals/demo-id');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.mobile-shell__title')).toBeVisible();
    await expect(
      page.locator('.mobile-page-sections .page-section')
    ).toHaveCount(1);
    await page.screenshot({
      path: path.join(screenshotRoot, 'arrivals-details-full.png'),
      fullPage: true,
    });

    await page.goto('/#/arrivals/demo-id/edit');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.mobile-shell__title')).toBeVisible();
    await expect(page.locator('.mobile-page-container')).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotRoot, 'arrivals-edit-surface-full.png'),
      fullPage: true,
    });

    await page.goto('/#/does-not-exist-route');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.mobile-shell__title')).toHaveText('404');
    await page.screenshot({
      path: path.join(screenshotRoot, 'arrivals-not-found-full.png'),
      fullPage: true,
    });
  });
});
