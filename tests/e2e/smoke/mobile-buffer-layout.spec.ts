import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '../fixtures';

const screenshotRoot = path.join(
  process.cwd(),
  '.artifacts',
  'mobile-buffer-layout'
);

type BufferGeometry = {
  sectionCount: number;
  h1Count: number;
  firstSectionBottom: number;
  mainBottomPaddingPx: number;
  mainRailLeft: number;
  mainRailRight: number;
  headerRailLeft: number;
  headerRailRight: number;
  footerRailLeft: number;
  footerRailRight: number;
  firstHeadingTop: number;
  topActionCount: number;
  topActionMinWidth: number;
  topActionMinHeight: number;
  routeTop: number;
};

async function openBuffer(
  page: import('@playwright/test').Page
): Promise<void> {
  await page.goto('/#/buffer');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.mobile-shell__title')).toBeVisible();
}

test.describe('buffer page mobile composition (mobile viewport)', () => {
  test('validates canonical buffer composition and captures screenshots', async ({
    page,
  }) => {
    await openBuffer(page);

    const geometry = await page.evaluate((): BufferGeometry => {
      const toNumber = (value: string): number =>
        Number.parseFloat(value.replace('px', '').trim()) || 0;

      const sections = Array.from(
        document.querySelectorAll('.mobile-page-sections .page-section')
      ) as HTMLElement[];
      const [firstSection] = sections;
      const main = document.querySelector('.mobile-shell__main');
      const mainStyles = main ? getComputedStyle(main) : null;
      const header = document.querySelector('.mobile-shell__header');
      const headerRail = document.querySelector(
        '.mobile-shell__header .mobile-shell__rail'
      );
      const mainRail = document.querySelector(
        '.mobile-shell__main .mobile-shell__rail'
      );
      const footerRail = document.querySelector(
        '.mobile-shell__footer .mobile-shell__rail'
      );
      const topActions = Array.from(
        document.querySelectorAll('.mobile-shell__header button[aria-label]')
      );
      const topMinWidth = topActions.reduce(
        (min, node) =>
          Math.min(
            min,
            node.getBoundingClientRect().width || Number.POSITIVE_INFINITY
          ),
        Number.POSITIVE_INFINITY
      );
      const topMinHeight = topActions.reduce(
        (min, node) =>
          Math.min(
            min,
            node.getBoundingClientRect().height || Number.POSITIVE_INFINITY
          ),
        Number.POSITIVE_INFINITY
      );
      const headingNode = document.querySelector('.mobile-shell__title');
      const headerRect = header ? header.getBoundingClientRect() : null;

      return {
        sectionCount: sections.length,
        h1Count: document.querySelectorAll('.mobile-shell__title').length,
        firstSectionBottom: firstSection
          ? firstSection.getBoundingClientRect().bottom
          : 0,
        mainBottomPaddingPx: mainStyles
          ? toNumber(mainStyles.paddingBottom)
          : 0,
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
        firstHeadingTop: headingNode
          ? headingNode.getBoundingClientRect().top
          : 0,
        routeTop: headerRect ? headerRect.bottom : 0,
        topActionCount: topActions.length,
        topActionMinWidth: Number.isFinite(topMinWidth) ? topMinWidth : 0,
        topActionMinHeight: Number.isFinite(topMinHeight) ? topMinHeight : 0,
      };
    });

    await expect(page.locator('.mobile-page-sections')).toBeVisible();
    await expect(page.locator('.mobile-shell__title')).toHaveCount(1);

    expect(geometry.sectionCount).toBe(2);
    expect(geometry.h1Count).toBe(1);
    expect(geometry.topActionCount).toBeGreaterThanOrEqual(2);
    expect(geometry.topActionMinWidth).toBeGreaterThanOrEqual(40);
    expect(geometry.topActionMinHeight).toBeGreaterThanOrEqual(40);
    expect(geometry.mainBottomPaddingPx).toBeGreaterThanOrEqual(0);
    expect(geometry.mainBottomPaddingPx).toBeLessThan(40);
    expect(geometry.firstHeadingTop).toBeLessThanOrEqual(geometry.routeTop);
    expect(geometry.firstSectionBottom).toBeGreaterThan(geometry.routeTop);
    expect(geometry.mainRailLeft).toBeCloseTo(geometry.headerRailLeft, 1);
    expect(geometry.mainRailRight).toBeCloseTo(geometry.headerRailRight, 1);
    expect(geometry.mainRailLeft).toBeCloseTo(geometry.footerRailLeft, 1);
    expect(geometry.mainRailRight).toBeCloseTo(geometry.footerRailRight, 1);

    fs.mkdirSync(screenshotRoot, { recursive: true });
    await page.locator('.mobile-shell__header').screenshot({
      path: path.join(screenshotRoot, 'buffer-top.png'),
    });
    await page
      .locator('.mobile-page-sections .page-section')
      .first()
      .screenshot({
        path: path.join(screenshotRoot, 'buffer-controls.png'),
      });
    await page.screenshot({
      path: path.join(screenshotRoot, 'buffer-full.png'),
      fullPage: true,
    });
  });
});
