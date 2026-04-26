import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '../fixtures';

const screenshotRoot = path.join(
  process.cwd(),
  '.artifacts',
  'mobile-dashboard-layout'
);

type DashboardGeometry = {
  footerTop: number;
  headerActionMinWidth: number;
  headerActionMinHeight: number;
  sectionCount: number;
  lastSectionBottom: number;
  mainBottomPaddingPx: number;
  mainRailLeft: number;
  mainRailRight: number;
  headerRailLeft: number;
  headerRailRight: number;
  footerRailLeft: number;
  footerRailRight: number;
  mainClientHeight: number;
  favoriteTileCount: number;
  telemetryRowCount: number;
  helpTriggerCount: number;
  favoriteDescriptionCount: number;
  telemetryHasNetworkLabel: boolean;
  sectionTitleCount: number;
  firstFavoriteTop: number;
  footerHeight: number;
  viewportHeight: number;
  viewportWidth: number;
};

async function openRoot(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/#/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.mobile-page-sections')).toBeVisible();
}

test.describe('root page mobile composition', () => {
  test('validates shared composition and captures root layout screenshots', async ({
    page,
  }) => {
    await openRoot(page);
    await expect(page.locator('.home-favorite-tile')).toHaveCount(6);

    const geometry = await page.evaluate((): DashboardGeometry => {
      const toNumber = (value: string): number =>
        Number.parseFloat(value.replace('px', '').trim()) || 0;

      const sections = Array.from(
        document.querySelectorAll('.mobile-page-sections .page-section')
      ) as HTMLElement[];
      const lastSection = sections.at(-1);
      const main = document.querySelector('.mobile-shell__main');
      const mainStyles = main ? getComputedStyle(main) : null;
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
      const topActions = Array.from(
        document.querySelectorAll(
          '.mobile-shell__header .mobile-shell__utilities [aria-label]'
        )
      );
      const topActionRects = topActions.map((item) =>
        item.getBoundingClientRect()
      );
      const firstFavorite = document.querySelector('.home-favorite-tile');

      const minWidth = topActionRects.reduce(
        (min, rect) => Math.min(min, rect.width || Number.POSITIVE_INFINITY),
        Number.POSITIVE_INFINITY
      );
      const minHeight = topActionRects.reduce(
        (min, rect) => Math.min(min, rect.height || Number.POSITIVE_INFINITY),
        Number.POSITIVE_INFINITY
      );
      const footerRect = footer ? footer.getBoundingClientRect() : null;

      return {
        footerTop: footerRect ? footerRect.top : 0,
        headerActionMinWidth: Number.isFinite(minWidth) ? minWidth : 0,
        headerActionMinHeight: Number.isFinite(minHeight) ? minHeight : 0,
        sectionCount: sections.length,
        lastSectionBottom: lastSection
          ? lastSection.getBoundingClientRect().bottom
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
        mainClientHeight: main ? main.clientHeight : 0,
        favoriteTileCount: document.querySelectorAll('.home-favorite-tile')
          .length,
        telemetryRowCount: document.querySelectorAll('.home-telemetry-row')
          .length,
        helpTriggerCount: document.querySelectorAll(
          '.page-section__help-trigger'
        ).length,
        favoriteDescriptionCount: document.querySelectorAll(
          '.home-favorite-tile__description'
        ).length,
        telemetryHasNetworkLabel: Boolean(
          Array.from(document.querySelectorAll('.home-telemetry-row'))
            .map((node) => node.textContent ?? '')
            .some((text) => text.includes('Связь'))
        ),
        sectionTitleCount: document.querySelectorAll('.mobile-page-sections h2')
          .length,
        firstFavoriteTop: firstFavorite
          ? firstFavorite.getBoundingClientRect().top
          : 0,
        footerHeight: footerRect?.height ?? 0,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      };
    });

    await expect(
      page.locator('.mobile-page-sections .page-section')
    ).toHaveCount(2);
    await expect(page.locator('.home-favorite-tile')).toHaveCount(6);

    expect(geometry.sectionCount).toBe(2);
    expect(geometry.telemetryRowCount).toBe(5);
    expect(geometry.favoriteTileCount).toBe(6);
    expect(geometry.helpTriggerCount).toBe(2);
    expect(geometry.favoriteDescriptionCount).toBe(0);
    expect(geometry.telemetryHasNetworkLabel).toBe(false);
    expect(geometry.sectionTitleCount).toBe(0);
    expect(geometry.headerActionMinWidth).toBeGreaterThanOrEqual(40);
    expect(geometry.headerActionMinHeight).toBeGreaterThanOrEqual(40);
    expect(geometry.mainBottomPaddingPx).toBeGreaterThanOrEqual(0);
    expect(geometry.mainBottomPaddingPx).toBeLessThan(40);
    expect(geometry.mainRailLeft).toBeCloseTo(geometry.headerRailLeft, 1);
    expect(geometry.mainRailRight).toBeCloseTo(geometry.headerRailRight, 1);
    expect(geometry.mainRailLeft).toBeCloseTo(geometry.footerRailLeft, 1);
    expect(geometry.mainRailRight).toBeCloseTo(geometry.footerRailRight, 1);
    expect(geometry.mainRailLeft).toBeCloseTo(
      (geometry.viewportWidth -
        (geometry.mainRailRight - geometry.mainRailLeft)) /
        2,
      1
    );
    expect(geometry.mainClientHeight).toBeGreaterThan(0);
    expect(geometry.firstFavoriteTop).toBeLessThan(
      geometry.viewportHeight - geometry.footerHeight
    );

    await page.evaluate(() => {
      const main = document.querySelector<HTMLElement>('.mobile-shell__main');
      if (main) {
        main.scrollTop = main.scrollHeight;
      }
    });
    await page.waitForTimeout(120);

    const scrolledGeometry = await page.evaluate(() => {
      const footer = document.querySelector('.mobile-shell__footer');
      const lastSection = document.querySelectorAll<HTMLElement>(
        '.mobile-page-sections .page-section'
      );
      const target = lastSection[lastSection.length - 1];

      return {
        footerTop: footer?.getBoundingClientRect().top ?? 0,
        lastSectionBottom: target?.getBoundingClientRect().bottom ?? 0,
      };
    });

    expect(scrolledGeometry.lastSectionBottom).toBeLessThan(
      scrolledGeometry.footerTop + 1
    );

    fs.mkdirSync(screenshotRoot, { recursive: true });
    await page
      .locator('.page-section')
      .first()
      .screenshot({
        path: path.join(screenshotRoot, 'root-telemetry.png'),
      });
    await page.locator('.mobile-page-sections').screenshot({
      path: path.join(screenshotRoot, 'root-sections.png'),
    });
    await page
      .locator('.home-favorite-tile')
      .first()
      .screenshot({
        path: path.join(screenshotRoot, 'root-favorite-tile.png'),
      });
    await page.screenshot({
      path: path.join(screenshotRoot, 'root-full.png'),
      fullPage: true,
    });
  });
});
