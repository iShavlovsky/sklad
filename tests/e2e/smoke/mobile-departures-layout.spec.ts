import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '../fixtures';

const screenshotRoot = path.join(
  process.cwd(),
  '.artifacts',
  'mobile-departures-layout'
);

type DeparturesGeometry = {
  h1Count: number;
  createButtonCount: number;
  topActionCount: number;
  topActionMinWidth: number;
  topActionMinHeight: number;
  sectionCount: number;
  pageBottomPadding: number;
  headerRailLeft: number;
  headerRailRight: number;
  mainRailLeft: number;
  mainRailRight: number;
  footerRailLeft: number;
  footerRailRight: number;
  routeTop: number;
  firstSectionBottom: number;
  footerTop: number;
  routeContentTop: number;
  firstHeadingTop: number;
  hasBottomSpacer: boolean;
};

type DepartureRouteCase = {
  route: string;
  screenshotPrefix: string;
  expectedSectionCountMin: number;
  expectsContentToEndAboveFooter?: boolean;
};

function assertAligned(
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

async function openDeparturesRoute(
  page: import('@playwright/test').Page,
  route: string
): Promise<void> {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.mobile-shell__title')).toBeVisible();
}

function collectGeometry(): DeparturesGeometry {
  const toNumber = (value: string): number =>
    Number.parseFloat(value.replace('px', '').trim()) || 0;

  const sections = Array.from(
    document.querySelectorAll('.mobile-page-sections .page-section')
  ) as HTMLElement[];
  const [firstSection] = sections;
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
  const routeContent = document.querySelector('.mobile-page-container');
  const headingNode = document.querySelector('.mobile-shell__title');

  const topMinWidth = Array.from(topActions).reduce(
    (min, node) => Math.min(min, node.getBoundingClientRect().width),
    Number.POSITIVE_INFINITY
  );
  const topMinHeight = Array.from(topActions).reduce(
    (min, node) => Math.min(min, node.getBoundingClientRect().height),
    Number.POSITIVE_INFINITY
  );

  const mainStyles = main ? getComputedStyle(main) : null;
  const headerRect = header ? header.getBoundingClientRect() : null;
  const footerRect = footer ? footer.getBoundingClientRect() : null;
  const headingRect = headingNode ? headingNode.getBoundingClientRect() : null;
  const routeRect = routeContent ? routeContent.getBoundingClientRect() : null;

  return {
    h1Count: document.querySelectorAll('.mobile-shell__title').length,
    topActionCount: topActions.length,
    topActionMinWidth: Number.isFinite(topMinWidth) ? topMinWidth : 0,
    topActionMinHeight: Number.isFinite(topMinHeight) ? topMinHeight : 0,
    sectionCount: sections.length,
    pageBottomPadding: mainStyles ? toNumber(mainStyles.paddingBottom) : 0,
    headerRailLeft: headerRail ? headerRail.getBoundingClientRect().left : 0,
    headerRailRight: headerRail ? headerRail.getBoundingClientRect().right : 0,
    mainRailLeft: mainRail ? mainRail.getBoundingClientRect().left : 0,
    mainRailRight: mainRail ? mainRail.getBoundingClientRect().right : 0,
    footerRailLeft: footerRail ? footerRail.getBoundingClientRect().left : 0,
    footerRailRight: footerRail ? footerRail.getBoundingClientRect().right : 0,
    routeTop: headerRect ? headerRect.bottom : 0,
    firstSectionBottom: firstSection
      ? firstSection.getBoundingClientRect().bottom
      : 0,
    footerTop: footerRect ? footerRect.top : 0,
    routeContentTop: routeRect ? routeRect.top : 0,
    firstHeadingTop: headingRect ? headingRect.top : 0,
    hasBottomSpacer: Boolean(
      document.querySelector('.mobile-page-bottom-spacer')
    ),
    createButtonCount: document.querySelectorAll(
      '[data-testid="departures-create-button"]'
    ).length,
  };
}

async function runRouteGeometryAssertion(
  page: import('@playwright/test').Page,
  testCase: DepartureRouteCase
) {
  await openDeparturesRoute(page, `/#${testCase.route}`);

  const geometry = await page.evaluate(collectGeometry);

  await expect(page.locator('.mobile-shell__title')).toBeVisible();
  await expect(page.locator('.mobile-page-sections')).toBeVisible();

  expect(geometry.h1Count).toBe(1);
  expect(geometry.topActionCount).toBeGreaterThanOrEqual(2);
  expect(geometry.topActionMinWidth).toBeGreaterThanOrEqual(40);
  expect(geometry.topActionMinHeight).toBeGreaterThanOrEqual(40);
  expect(geometry.sectionCount).toBeGreaterThanOrEqual(
    testCase.expectedSectionCountMin
  );
  expect(geometry.pageBottomPadding).toBeGreaterThanOrEqual(0);
  expect(geometry.pageBottomPadding).toBeLessThan(40);
  expect(geometry.routeTop).toBeLessThanOrEqual(geometry.routeContentTop + 1);
  expect(geometry.firstHeadingTop).toBeLessThanOrEqual(geometry.routeTop);
  if (geometry.sectionCount > 0) {
    if (testCase.expectsContentToEndAboveFooter === false) {
      expect(geometry.firstSectionBottom).toBeGreaterThan(geometry.footerTop);
    } else {
      expect(geometry.firstSectionBottom).toBeLessThanOrEqual(
        geometry.footerTop
      );
    }
  }
  expect(geometry.hasBottomSpacer).toBe(true);

  assertAligned(
    geometry.headerRailLeft,
    geometry.mainRailLeft,
    geometry.headerRailRight,
    geometry.mainRailRight,
    `${testCase.route}: header and main`
  );
  assertAligned(
    geometry.mainRailLeft,
    geometry.footerRailLeft,
    geometry.mainRailRight,
    geometry.footerRailRight,
    `${testCase.route}: main and footer`
  );

  if (testCase.route === '/departures') {
    expect(geometry.createButtonCount).toBeGreaterThanOrEqual(1);
    await expect(page.getByTestId('departures-create-button')).toBeVisible();
  }

  fs.mkdirSync(screenshotRoot, { recursive: true });
  await page.locator('.mobile-shell__header').screenshot({
    path: path.join(screenshotRoot, `${testCase.screenshotPrefix}-top.png`),
  });
  await page.locator('.mobile-page-sections').screenshot({
    path: path.join(
      screenshotRoot,
      `${testCase.screenshotPrefix}-sections.png`
    ),
  });
  await page.screenshot({
    path: path.join(screenshotRoot, `${testCase.screenshotPrefix}-full.png`),
    fullPage: true,
  });
}

test.describe('departures family mobile composition (mobile viewport)', () => {
  const departureCases: DepartureRouteCase[] = [
    {
      route: '/departures',
      screenshotPrefix: 'departures',
      expectedSectionCountMin: 1,
      expectsContentToEndAboveFooter: true,
    },
    {
      route: '/departures/create',
      screenshotPrefix: 'departures-create',
      expectedSectionCountMin: 0,
      expectsContentToEndAboveFooter: false,
    },
    {
      route: '/departures/demo-id',
      screenshotPrefix: 'departures-details',
      expectedSectionCountMin: 1,
      expectsContentToEndAboveFooter: true,
    },
    {
      route: '/departures/demo-id/edit',
      screenshotPrefix: 'departures-edit',
      expectedSectionCountMin: 2,
      expectsContentToEndAboveFooter: true,
    },
  ];

  for (const item of departureCases) {
    test(`validates canonical composition on ${item.route}`, async ({
      page,
    }) => {
      await runRouteGeometryAssertion(page, item);
    });
  }
});
