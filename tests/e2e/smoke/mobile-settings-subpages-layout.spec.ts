import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '../fixtures';

const screenshotRoot = path.join(
  process.cwd(),
  '.artifacts',
  'mobile-settings-layout'
);

type SettingsSubpageGeometry = {
  sectionCount: number;
  topActionCount: number;
  topActionMinWidth: number;
  topActionMinHeight: number;
  headerRailLeft: number;
  headerRailRight: number;
  mainRailLeft: number;
  mainRailRight: number;
  footerRailLeft: number;
  footerRailRight: number;
  routeTop: number;
  routeContentTop: number;
  firstSectionBottom: number;
  footerTop: number;
  hasBottomSpacer: boolean;
};

type SettingsSubpageCase = {
  route: string;
  expectedSectionCount: number;
  screenshotPrefix: string;
};

const subpageCases: SettingsSubpageCase[] = [
  {
    route: '/#/settings/profile',
    expectedSectionCount: 1,
    screenshotPrefix: 'settings-profile',
  },
  {
    route: '/#/settings/backup',
    expectedSectionCount: 5,
    screenshotPrefix: 'settings-backup',
  },
  {
    route: '/#/settings/about',
    expectedSectionCount: 1,
    screenshotPrefix: 'settings-about',
  },
];

async function openSubpage(
  page: import('@playwright/test').Page,
  route: string
) {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('banner')).toBeVisible();
}

test.describe('settings subpages mobile composition (mobile viewport)', () => {
  for (const testCase of subpageCases) {
    test(`validates canonical settings subpage composition for ${testCase.route}`, async ({
      page,
    }) => {
      await openSubpage(page, testCase.route);

      const geometry = await page.evaluate((): SettingsSubpageGeometry => {
        const sections = Array.from(
          document.querySelectorAll('.mobile-page-sections .page-section')
        ) as HTMLElement[];
        const [firstSection] = sections;
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
        const topActions = Array.from(
          document.querySelectorAll(
            '.mobile-shell__header button[aria-label], .mobile-shell__header a[aria-label]'
          )
        );
        const routeContent = document.querySelector('.mobile-page-container');
        const routeContentRect = routeContent?.getBoundingClientRect();
        const footerRect = footer ? footer.getBoundingClientRect() : null;

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

        return {
          sectionCount: sections.length,
          topActionCount: topActions.length,
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
          routeTop: header ? header.getBoundingClientRect().bottom : 0,
          routeContentTop: routeContentRect ? routeContentRect.top : 0,
          firstSectionBottom: firstSection
            ? firstSection.getBoundingClientRect().bottom
            : 0,
          footerTop: footerRect ? footerRect.top : 0,
          hasBottomSpacer: Boolean(
            document.querySelector('.mobile-page-bottom-spacer')
          ),
        };
      });

      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.locator('.mobile-page-sections')).toBeVisible();
      await expect(
        page.locator('.mobile-page-sections .page-section')
      ).toHaveCount(testCase.expectedSectionCount);

      expect(geometry.sectionCount).toBe(testCase.expectedSectionCount);
      expect(geometry.topActionCount).toBeGreaterThanOrEqual(3);
      expect(geometry.topActionMinWidth).toBeGreaterThanOrEqual(40);
      expect(geometry.topActionMinHeight).toBeGreaterThanOrEqual(40);
      expect(geometry.routeTop).toBeLessThanOrEqual(
        geometry.routeContentTop + 1
      );
      expect(geometry.firstSectionBottom).toBeLessThanOrEqual(
        geometry.footerTop
      );
      expect(geometry.hasBottomSpacer).toBe(true);
      expect(
        Math.abs(geometry.headerRailLeft - geometry.mainRailLeft)
      ).toBeLessThanOrEqual(2);
      expect(
        Math.abs(geometry.headerRailRight - geometry.mainRailRight)
      ).toBeLessThanOrEqual(2);
      expect(
        Math.abs(geometry.mainRailLeft - geometry.footerRailLeft)
      ).toBeLessThanOrEqual(2);
      expect(
        Math.abs(geometry.mainRailRight - geometry.footerRailRight)
      ).toBeLessThanOrEqual(2);

      fs.mkdirSync(screenshotRoot, { recursive: true });
      await page.getByRole('banner').screenshot({
        path: path.join(screenshotRoot, `${testCase.screenshotPrefix}-top.png`),
      });
      await page.locator('.mobile-page-sections').screenshot({
        path: path.join(
          screenshotRoot,
          `${testCase.screenshotPrefix}-sections.png`
        ),
      });
      await page.screenshot({
        path: path.join(
          screenshotRoot,
          `${testCase.screenshotPrefix}-full.png`
        ),
        fullPage: true,
      });
    });
  }
});
