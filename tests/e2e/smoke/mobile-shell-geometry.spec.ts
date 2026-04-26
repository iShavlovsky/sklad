import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '../fixtures';

type ShellBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type ShellLayoutMetrics = {
  headerRect: ShellBox | null;
  mainRect: ShellBox | null;
  footerRect: ShellBox | null;
  mainPanelRect: ShellBox | null;
  headerRailRect: ShellBox | null;
  mainRailRect: ShellBox | null;
  footerRailRect: ShellBox | null;
  topActionCount: number;
  navItemCount: number;
  activeNavCount: number;
  topTargetMinWidth: number;
  topTargetMinHeight: number;
  navTargetMinWidth: number;
  navTargetMinHeight: number;
  safeAreaBottomVar: string;
  safeAreaBottomAliasVar: string;
  hasMobileSafeAreaVarDeclaration: boolean;
  hasShellSafeAreaVarDeclaration: boolean;
  mainBottomPaddingPx: number;
  mainTopPaddingPx: number;
  mainPanelTopPaddingPx: number;
  footerPaddingBottomPx: number;
  mainTopOffset: number;
  mainPanelTopOffset: number;
  routeContentTop: number;
  firstRouteHeadingTop: number;
  firstRouteHeadingText: string;
  routeContentNode: string;
  canScrollMain: boolean;
  canScrollWithProbe: boolean;
  scrolledToBottom: boolean;
  scrollDelta: number;
  probeRectBottom: number;
  probeBottomVisible: boolean;
  scrollOwner: string;
  htmlOverflow: string;
  bodyOverflow: string;
  rootOverflow: string;
  mainOverflowY: string;
  mainPanelOverflow: string;
  mainScrollHeight: number;
  mainClientHeight: number;
  dialogOpened: boolean;
};

type RouteCase = {
  route: `/${string}`;
  hasBottomNavActiveExpectation: boolean;
  expectScrollable: boolean;
  screenshotName: string;
};

const screenshotRoot = path.join(
  process.cwd(),
  '.artifacts',
  'mobile-shell-geometry'
);

const mobileShellRouteCases: RouteCase[] = [
  {
    route: '/',
    hasBottomNavActiveExpectation: true,
    expectScrollable: false,
    screenshotName: 'root.png',
  },
  {
    route: '/buffer',
    hasBottomNavActiveExpectation: false,
    expectScrollable: true,
    screenshotName: 'buffer.png',
  },
  {
    route: '/stocks',
    hasBottomNavActiveExpectation: true,
    expectScrollable: false,
    screenshotName: 'stocks.png',
  },
  {
    route: '/arrivals',
    hasBottomNavActiveExpectation: true,
    expectScrollable: false,
    screenshotName: 'arrivals.png',
  },
  {
    route: '/settings',
    hasBottomNavActiveExpectation: false,
    expectScrollable: true,
    screenshotName: 'settings.png',
  },
  {
    route: '/arrivals/demo-id',
    hasBottomNavActiveExpectation: true,
    expectScrollable: true,
    screenshotName: 'arrivals-details.png',
  },
];

async function openRoute(
  page: import('@playwright/test').Page,
  route: RouteCase['route']
) {
  await page.goto(`/#${route}`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.mobile-shell__main')).toBeVisible();
}

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

async function forceScrollableForSnapshot(
  page: import('@playwright/test').Page
): Promise<void> {
  await page.evaluate(() => {
    const main = document.querySelector<HTMLElement>('.mobile-shell__main');
    const mainPanel = document.querySelector<HTMLElement>(
      '.mobile-shell__main-panel'
    );

    if (!main || !mainPanel) {
      return;
    }

    if (main.scrollHeight > main.clientHeight + 1) {
      return;
    }

    const probe = document.createElement('div');
    probe.dataset.shellScrollProbe = '1';
    probe.style.height = '1200px';
    probe.style.width = '1px';
    probe.style.visibility = 'hidden';
    mainPanel.appendChild(probe);
  });
}

async function readShellMetrics(
  page: import('@playwright/test').Page
): Promise<ShellLayoutMetrics> {
  return page.evaluate((): ShellLayoutMetrics => {
    const rootStyles = getComputedStyle(document.documentElement);
    const hasCssVariableDeclaration = (variableName: string): boolean => {
      for (const styleSheet of Array.from(document.styleSheets)) {
        try {
          const rules = Array.from(styleSheet.cssRules || []);

          for (const rule of rules) {
            if (rule.cssText.includes(variableName)) {
              return true;
            }
          }
        } catch {
          // Ignore cross-origin or inaccessible style sheets.
        }
      }

      return false;
    };

    const asBox = (element: Element | null): ShellBox | null => {
      if (!element) {
        return null;
      }

      const rect = element.getBoundingClientRect();

      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      };
    };

    const toNumber = (value: string): number =>
      Number.parseFloat(value.replace('px', '').trim()) || 0;

    const header = document.querySelector('.mobile-shell__header');
    const main = document.querySelector('.mobile-shell__main');
    const footer = document.querySelector('.mobile-shell__footer');
    const mainPanel = document.querySelector('.mobile-shell__main-panel');
    const headerRail = document.querySelector(
      '.mobile-shell__header .mobile-shell__rail'
    );
    const mainRail = document.querySelector(
      '.mobile-shell__main .mobile-shell__rail'
    );
    const footerRail = document.querySelector(
      '.mobile-shell__footer .mobile-shell__rail'
    );

    const topActionButtons = Array.from(
      document.querySelectorAll(
        '.mobile-shell__header .mobile-shell__utilities [aria-label]'
      )
    );
    const navItems = Array.from(
      document.querySelectorAll('.mobile-bottom-nav__item')
    );

    const topMinWidth = topActionButtons.reduce(
      (min, node) =>
        Math.min(
          min,
          node.getBoundingClientRect().width || Number.POSITIVE_INFINITY
        ),
      Number.POSITIVE_INFINITY
    );

    const topMinHeight = topActionButtons.reduce(
      (min, node) =>
        Math.min(
          min,
          node.getBoundingClientRect().height || Number.POSITIVE_INFINITY
        ),
      Number.POSITIVE_INFINITY
    );

    const navMinWidth = navItems.reduce(
      (min, node) =>
        Math.min(
          min,
          node.getBoundingClientRect().width || Number.POSITIVE_INFINITY
        ),
      Number.POSITIVE_INFINITY
    );

    const navMinHeight = navItems.reduce(
      (min, node) =>
        Math.min(
          min,
          node.getBoundingClientRect().height || Number.POSITIVE_INFINITY
        ),
      Number.POSITIVE_INFINITY
    );

    const mainStyles = main ? getComputedStyle(main) : null;
    const footerStyles = footer ? getComputedStyle(footer) : null;
    const routeContentNode =
      (mainPanel &&
        Array.from(mainPanel.children).find((node) => {
          const rect = node.getBoundingClientRect();

          return rect.height > 0 || rect.width > 0;
        })) ||
      document.querySelector(
        '.mobile-page-container, .mobile-page-header, .mobile-page-intro, .mobile-page-sections, .mobile-page-sections .page-section, .page-section'
      );
    const routeContentRect = routeContentNode?.getBoundingClientRect();
    const mainPanelTopStyles = mainPanel ? getComputedStyle(mainPanel) : null;
    const headingNode = mainPanel?.querySelector('h1');
    const headingRect = headingNode?.getBoundingClientRect();

    const probe = document.querySelector<HTMLElement>(
      '[data-shell-scroll-probe]'
    );
    let canScrollMain = Boolean(
      main && main.scrollHeight > main.clientHeight + 1
    );
    let scrolledToBottom = false;
    let scrollDelta = 0;
    let probeVisible = false;
    let probeBottom = 0;

    if (main && main.scrollHeight > main.clientHeight + 1) {
      const originalScrollTop = main.scrollTop;
      main.scrollTop = main.scrollHeight;
      scrolledToBottom = main.scrollTop > originalScrollTop;
      scrollDelta = main.scrollTop - originalScrollTop;
      main.scrollTop = originalScrollTop;
    } else {
      const mainPanelForProbe = mainPanel;
      if (!probe && main && mainPanelForProbe) {
        const created = document.createElement('div');
        created.dataset.shellScrollProbe = '1';
        created.dataset.shellScrollProbeTemporary = '1';
        created.style.height = '1200px';
        created.style.width = '1px';
        created.style.visibility = 'hidden';
        mainPanelForProbe.appendChild(created);
      }

      canScrollMain = Boolean(
        main && main.scrollHeight > main.clientHeight + 1
      );

      if (main && canScrollMain) {
        const footerRect = footer ? footer.getBoundingClientRect() : { top: 0 };
        const originalScrollTop = main.scrollTop;
        main.scrollTop = main.scrollHeight;
        scrolledToBottom = main.scrollTop > originalScrollTop;
        scrollDelta = main.scrollTop - originalScrollTop;
        const targetProbe = document.querySelector<HTMLElement>(
          '[data-shell-scroll-probe]'
        );
        if (targetProbe) {
          const probeRect = targetProbe.getBoundingClientRect();
          probeBottom = probeRect.bottom;
          probeVisible = probeRect.bottom <= footerRect.top;
        }
        main.scrollTop = originalScrollTop;
      }

      const tempProbe = document.querySelector<HTMLElement>(
        '[data-shell-scroll-probe]'
      );
      if (tempProbe && tempProbe.dataset.shellScrollProbeTemporary === '1') {
        tempProbe.remove();
      }
    }

    if (probe) {
      const probeRect = probe.getBoundingClientRect();
      const footerRect = footer ? footer.getBoundingClientRect() : { top: 0 };
      probeBottom = probeRect.bottom;
      probeVisible = probeRect.bottom <= footerRect.top;
    }

    if (main && !canScrollMain && probe) {
      canScrollMain = true;
    }

    return {
      headerRect: asBox(header),
      mainRect: asBox(main),
      footerRect: asBox(footer),
      mainPanelRect: asBox(mainPanel),
      headerRailRect: asBox(headerRail),
      mainRailRect: asBox(mainRail),
      footerRailRect: asBox(footerRail),
      topActionCount: topActionButtons.length,
      navItemCount: navItems.length,
      activeNavCount: document.querySelectorAll(
        '.mobile-bottom-nav__item[aria-current="page"]'
      ).length,
      topTargetMinWidth: Number.isFinite(topMinWidth) ? topMinWidth : 0,
      topTargetMinHeight: Number.isFinite(topMinHeight) ? topMinHeight : 0,
      navTargetMinWidth: Number.isFinite(navMinWidth) ? navMinWidth : 0,
      navTargetMinHeight: Number.isFinite(navMinHeight) ? navMinHeight : 0,
      safeAreaBottomVar: rootStyles
        .getPropertyValue('--sl-shell-safe-area-inset-bottom')
        .trim(),
      safeAreaBottomAliasVar: rootStyles
        .getPropertyValue('--sl-shell-safe-area-inset-bottom')
        .trim(),
      hasMobileSafeAreaVarDeclaration: hasCssVariableDeclaration(
        '--sl-shell-safe-area-inset-bottom'
      ),
      hasShellSafeAreaVarDeclaration: hasCssVariableDeclaration(
        '--sl-shell-safe-area-inset-bottom'
      ),
      mainBottomPaddingPx: mainStyles ? toNumber(mainStyles.paddingBottom) : 0,
      mainTopPaddingPx: mainStyles ? toNumber(mainStyles.paddingTop) : 0,
      footerPaddingBottomPx: footerStyles
        ? toNumber(footerStyles.paddingBottom)
        : 0,
      mainPanelTopPaddingPx: mainPanelTopStyles
        ? toNumber(mainPanelTopStyles.paddingTop)
        : 0,
      mainTopOffset: main ? main.getBoundingClientRect().top : 0,
      mainPanelTopOffset: mainPanel ? mainPanel.getBoundingClientRect().top : 0,
      routeContentTop: routeContentRect ? routeContentRect.top : 0,
      firstRouteHeadingTop: headingRect
        ? headingRect.top
        : routeContentRect?.top || 0,
      firstRouteHeadingText: headingNode?.textContent?.trim() || '',
      routeContentNode: routeContentNode
        ? routeContentNode.className || routeContentNode.tagName.toLowerCase()
        : 'missing',
      canScrollMain: main ? main.scrollHeight > main.clientHeight + 1 : false,
      canScrollWithProbe: canScrollMain,
      scrolledToBottom,
      scrollDelta,
      probeRectBottom: probeBottom,
      probeBottomVisible: probeVisible,
      scrollOwner:
        main && getComputedStyle(main).overflowY === 'auto'
          ? 'mobile-shell__main'
          : canScrollMain
            ? 'mobile-shell__main-probe'
            : 'missing',
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      bodyOverflow: getComputedStyle(document.body).overflow,
      rootOverflow: getComputedStyle(
        document.querySelector('#root') ?? document.body
      ).overflow,
      mainOverflowY: mainStyles ? mainStyles.overflowY : '',
      mainPanelOverflow: mainPanel ? getComputedStyle(mainPanel).overflow : '',
      mainScrollHeight: main ? main.scrollHeight : 0,
      mainClientHeight: main ? main.clientHeight : 0,
      dialogOpened: Boolean(document.querySelector('[role="dialog"]')),
    };
  });
}

test.describe('mobile shell geometry contract (mobile viewport)', () => {
  for (const item of mobileShellRouteCases) {
    test(`validates canonical shell geometry on ${item.route}`, async ({
      page,
    }) => {
      await openRoute(page, item.route);

      const metrics = await readShellMetrics(page);

      await expect(page.locator('.mobile-shell__header')).toBeVisible();
      await expect(page.locator('.mobile-shell__footer')).toBeVisible();

      await expect(page.locator('.mobile-bottom-nav__item')).toHaveCount(4);
      expect(metrics.navItemCount).toBe(4);
      expect(metrics.activeNavCount).toBe(
        item.hasBottomNavActiveExpectation ? 1 : 0
      );

      if (item.hasBottomNavActiveExpectation) {
        const activeRouteLabel = await page
          .locator('.mobile-bottom-nav__item[aria-current="page"]')
          .first()
          .getAttribute('aria-label');
        expect(activeRouteLabel).not.toBeNull();
        expect(activeRouteLabel?.length).toBeGreaterThan(2);
      }

      expect(metrics.topActionCount).toBeGreaterThanOrEqual(3);
      const topHeaderButtons = page.locator(
        '.mobile-shell__header .mobile-shell__utilities [aria-label]'
      );
      const topHeaderButtonCount = await topHeaderButtons.count();
      expect(topHeaderButtonCount).toBeGreaterThanOrEqual(3);

      for (let i = 0; i < topHeaderButtonCount; i += 1) {
        const ariaLabel = await topHeaderButtons
          .nth(i)
          .getAttribute('aria-label');
        expect(ariaLabel, `top action button #${i}`).toBeTruthy();
        expect(ariaLabel?.trim().length).toBeGreaterThan(0);
      }

      expect(metrics.topTargetMinWidth).toBeGreaterThanOrEqual(40);
      expect(metrics.topTargetMinHeight).toBeGreaterThanOrEqual(40);
      expect(metrics.navTargetMinWidth).toBeGreaterThanOrEqual(40);
      expect(metrics.navTargetMinHeight).toBeGreaterThanOrEqual(40);

      expect(metrics.mainBottomPaddingPx).toBeGreaterThan(0);
      expect(metrics.mainBottomPaddingPx).toBeLessThan(40);
      expect(metrics.footerPaddingBottomPx).toBeGreaterThanOrEqual(0);
      expect(metrics.hasMobileSafeAreaVarDeclaration).toBe(true);
      expect(metrics.hasShellSafeAreaVarDeclaration).toBe(true);
      expect(metrics.safeAreaBottomVar).toBeDefined();
      expect(metrics.routeContentTop).toBeGreaterThanOrEqual(
        metrics.mainTopOffset
      );
      expect(metrics.headerRect).not.toBeNull();
      expect(metrics.mainRect).not.toBeNull();
      expect(metrics.footerRect).not.toBeNull();
      expect(metrics.mainPanelRect).not.toBeNull();
      expect(metrics.headerRailRect).not.toBeNull();
      expect(metrics.mainRailRect).not.toBeNull();
      expect(metrics.footerRailRect).not.toBeNull();
      expect(metrics.mainScrollHeight).toBeGreaterThan(0);
      expect(metrics.scrollOwner).toBe('mobile-shell__main');
      expect(metrics.mainOverflowY).toBe('auto');
      expect(metrics.mainPanelOverflow).not.toBe('hidden');
      expect(metrics.htmlOverflow).toBe('hidden');
      expect(metrics.bodyOverflow).toBe('hidden');
      expect(metrics.routeContentNode).not.toBe('missing');
      expect(metrics.dialogOpened).toBe(false);

      const { headerRect, headerRailRect, mainRailRect, footerRailRect } =
        metrics;

      if (
        headerRect === null ||
        headerRailRect === null ||
        mainRailRect === null ||
        footerRailRect === null
      ) {
        throw new Error('Missing shell geometry rectangles');
      }

      expect(metrics.routeContentTop).toBeGreaterThanOrEqual(
        headerRect.bottom - 1
      );
      expect(metrics.firstRouteHeadingTop).toBeGreaterThanOrEqual(
        headerRect.bottom - 1
      );
      if (item.route === '/') {
        expect(metrics.firstRouteHeadingText.length).toBe(0);
      } else {
        expect(metrics.firstRouteHeadingText.length).toBeGreaterThan(0);
      }

      assertAligned(
        headerRailRect.left,
        mainRailRect.left,
        headerRailRect.right,
        mainRailRect.right,
        'header-main rail alignment'
      );
      assertAligned(
        mainRailRect.left,
        footerRailRect.left,
        mainRailRect.right,
        footerRailRect.right,
        'main-footer rail alignment'
      );

      await forceScrollableForSnapshot(page);
      fs.mkdirSync(screenshotRoot, { recursive: true });
      await page.screenshot({
        path: path.join(screenshotRoot, item.screenshotName),
        fullPage: true,
      });

      await page.evaluate(() => {
        const main = document.querySelector<HTMLElement>('.mobile-shell__main');
        if (!main) {
          return;
        }
        main.scrollTop = main.scrollHeight / 2;
      });
      await page.waitForTimeout(120);
      await page.screenshot({
        path: path.join(
          screenshotRoot,
          item.screenshotName.replace('.png', '-mid.png')
        ),
        fullPage: true,
      });

      await page.evaluate(() => {
        const main = document.querySelector<HTMLElement>('.mobile-shell__main');
        if (!main) {
          return;
        }
        main.scrollTop = main.scrollHeight;
      });
      await page.waitForTimeout(120);
      await page.screenshot({
        path: path.join(
          screenshotRoot,
          item.screenshotName.replace('.png', '-bottom.png')
        ),
        fullPage: true,
      });

      await page.evaluate(() => {
        const main = document.querySelector<HTMLElement>('.mobile-shell__main');
        const probe = document.querySelector<HTMLElement>(
          '[data-shell-scroll-probe]'
        );
        if (main) {
          main.scrollTop = 0;
        }
        probe?.remove();
      });
    });
  }
});
