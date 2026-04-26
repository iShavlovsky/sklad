import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '../fixtures';

type DraftsGeometry = {
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
  routeContentNode: string;
  hasBottomSpacer: boolean;
};

type DraftsRouteCase = {
  caseLabel: string;
  route: string;
  expectedSectionCount: number;
  screenshotName: string;
};

const screenshotRoot = path.join(
  process.cwd(),
  '.artifacts',
  'mobile-drafts-layout'
);

const draftCases: DraftsRouteCase[] = [
  {
    caseLabel: 'list',
    route: '/#/drafts',
    expectedSectionCount: 1,
    screenshotName: 'drafts-list',
  },
  {
    caseLabel: 'create',
    route: '/#/drafts/create',
    expectedSectionCount: 0,
    screenshotName: 'drafts-create',
  },
  {
    caseLabel: 'details',
    route: '/#/drafts/placeholder-id',
    expectedSectionCount: 1,
    screenshotName: 'drafts-details',
  },
  {
    caseLabel: 'edit',
    route: '/#/drafts/placeholder-id/edit',
    expectedSectionCount: 0,
    screenshotName: 'drafts-edit',
  },
];

async function openDraftsRoute(
  page: import('@playwright/test').Page,
  route: string
): Promise<void> {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('banner')).toBeVisible();
}

function alignRails(
  leftA: number,
  leftB: number,
  rightA: number,
  rightB: number,
  label: string,
  tolerance = 2
) {
  expect(Math.abs(leftA - leftB), `${label}: left rails`).toBeLessThanOrEqual(
    tolerance
  );
  expect(
    Math.abs(rightA - rightB),
    `${label}: right rails`
  ).toBeLessThanOrEqual(tolerance);
}

test.describe('draft route pages mobile composition (mobile viewport)', () => {
  for (const testCase of draftCases) {
    test(`validates canonical drafts ${testCase.caseLabel} composition`, async ({
      page,
    }) => {
      await openDraftsRoute(page, testCase.route);

      const geometry = await page.evaluate((): DraftsGeometry => {
        const sections = Array.from(
          document.querySelectorAll('.mobile-page-sections .page-section')
        ) as HTMLElement[];
        const [firstSection] = sections;
        const header = document.querySelector('.mobile-shell__header');
        const footer = document.querySelector('.mobile-shell__footer');
        const mainContent = document.querySelector('.mobile-page-container');
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
        const routeContentNode =
          mainContent || document.querySelector('.mobile-page-sections');
        const routeContentRect = routeContentNode?.getBoundingClientRect();

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
          footerTop: footer ? footer.getBoundingClientRect().top : 0,
          routeContentNode: routeContentNode
            ? routeContentNode.className ||
              routeContentNode.tagName.toLowerCase()
            : 'missing',
          hasBottomSpacer: Boolean(
            document.querySelector('.mobile-page-bottom-spacer')
          ),
        };
      });

      await expect(page.locator('.mobile-page-container')).toBeVisible();
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.locator('.mobile-page-sections')).toBeVisible();
      await expect(
        page.locator('.mobile-page-sections .page-section')
      ).toHaveCount(testCase.expectedSectionCount);

      expect(geometry.sectionCount).toBe(testCase.expectedSectionCount);
      expect(geometry.topActionCount).toBeGreaterThanOrEqual(2);
      expect(geometry.topActionMinWidth).toBeGreaterThanOrEqual(40);
      expect(geometry.topActionMinHeight).toBeGreaterThanOrEqual(40);
      expect(geometry.routeTop).toBeLessThanOrEqual(
        geometry.routeContentTop + 1
      );
      expect(geometry.firstSectionBottom).toBeLessThanOrEqual(
        geometry.footerTop
      );
      expect(geometry.hasBottomSpacer).toBe(true);

      expect(geometry.routeContentNode).not.toBe('missing');

      alignRails(
        geometry.headerRailLeft,
        geometry.mainRailLeft,
        geometry.headerRailRight,
        geometry.mainRailRight,
        `${testCase.caseLabel}: header and main rails`
      );
      alignRails(
        geometry.mainRailLeft,
        geometry.footerRailLeft,
        geometry.mainRailRight,
        geometry.footerRailRight,
        `${testCase.caseLabel}: main and footer rails`
      );

      fs.mkdirSync(screenshotRoot, { recursive: true });
      await page.getByRole('banner').screenshot({
        path: path.join(screenshotRoot, `${testCase.screenshotName}-top.png`),
      });
      await page.locator('.mobile-page-sections').screenshot({
        path: path.join(
          screenshotRoot,
          `${testCase.screenshotName}-sections.png`
        ),
      });
      await page.screenshot({
        path: path.join(screenshotRoot, `${testCase.screenshotName}-full.png`),
        fullPage: true,
      });
    });
  }
});
