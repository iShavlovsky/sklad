import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '../fixtures';

const screenshotRoot = path.join(
  process.cwd(),
  '.artifacts',
  'mobile-home-navigation'
);

test.describe('mobile home and shell navigation flow', () => {
  test('keeps bottom navigation focus shape and dock padding aligned', async ({
    page,
  }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    const primaryNav = page.locator('.mobile-bottom-nav');
    await expect(
      primaryNav.locator('[data-item-id="root.dashboard"]')
    ).toBeVisible();

    let focusedBottomNav = false;
    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press('Tab');
      focusedBottomNav = await page.evaluate(() =>
        Boolean(document.activeElement?.closest('.mobile-bottom-nav'))
      );

      if (focusedBottomNav) {
        break;
      }
    }

    expect(focusedBottomNav).toBe(true);

    const metrics = await page.evaluate(() => {
      function toBox(node: Element | null) {
        const rect = node?.getBoundingClientRect();

        return rect
          ? {
              bottom: rect.bottom,
              height: rect.height,
              left: rect.left,
              right: rect.right,
              top: rect.top,
              width: rect.width,
            }
          : null;
      }

      function toNumber(value: string): number {
        const parsed = Number.parseFloat(value);

        return Number.isFinite(parsed) ? parsed : 0;
      }

      const input = document.activeElement as HTMLInputElement | null;
      const label =
        input?.id && typeof CSS !== 'undefined'
          ? document.querySelector<HTMLElement>(
              `label[for="${CSS.escape(input.id)}"]`
            )
          : input?.nextElementSibling instanceof HTMLElement
            ? input.nextElementSibling
            : null;
      const item = label?.querySelector<HTMLElement>('[data-item-id]') ?? null;
      const dock = document.querySelector<HTMLElement>(
        '.mobile-bottom-nav__dock'
      );
      const indicator = document.querySelector<HTMLElement>(
        '.mobile-bottom-nav__indicator'
      );
      const labelStyles = label ? getComputedStyle(label) : null;
      const itemStyles = item ? getComputedStyle(item) : null;
      const dockStyles = dock ? getComputedStyle(dock) : null;
      const rootStyles = getComputedStyle(document.documentElement);

      const dockBox = toBox(dock);
      const labelBox = toBox(label);
      const indicatorBox = toBox(indicator);

      return {
        dockBox,
        dockRadius: dockStyles ? toNumber(dockStyles.borderTopLeftRadius) : 0,
        focusedRole: input?.tagName.toLowerCase() ?? '',
        indicatorBox,
        itemBox: toBox(item),
        itemRadius: itemStyles ? toNumber(itemStyles.borderTopLeftRadius) : 0,
        labelBox,
        labelOutlineOffset: labelStyles
          ? toNumber(labelStyles.outlineOffset)
          : 0,
        labelOutlineStyle: labelStyles?.outlineStyle ?? '',
        labelOutlineWidth: labelStyles ? toNumber(labelStyles.outlineWidth) : 0,
        labelRadius: labelStyles
          ? toNumber(labelStyles.borderTopLeftRadius)
          : 0,
        paddingBottom: dockStyles ? toNumber(dockStyles.paddingBottom) : 0,
        paddingTop: dockStyles ? toNumber(dockStyles.paddingTop) : 0,
        controlRadius: toNumber(
          rootStyles.getPropertyValue('--sl-control-radius')
        ),
      };
    });

    expect(metrics.focusedRole).toBe('input');
    expect(metrics.labelOutlineStyle).toBe('solid');
    expect(metrics.labelOutlineWidth).toBeGreaterThan(0);
    expect(metrics.labelOutlineOffset).toBeLessThanOrEqual(0);
    expect(
      Math.abs(metrics.labelRadius - metrics.itemRadius)
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(metrics.dockRadius - metrics.controlRadius)
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(metrics.labelRadius - metrics.controlRadius)
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(metrics.paddingTop - metrics.paddingBottom)
    ).toBeLessThanOrEqual(1);

    expect(metrics.dockBox).not.toBeNull();
    expect(metrics.labelBox).not.toBeNull();
    expect(metrics.indicatorBox).not.toBeNull();

    if (metrics.dockBox && metrics.labelBox && metrics.indicatorBox) {
      const labelTopGap = metrics.labelBox.top - metrics.dockBox.top;
      const labelBottomGap = metrics.dockBox.bottom - metrics.labelBox.bottom;
      const indicatorTopGap = metrics.indicatorBox.top - metrics.dockBox.top;
      const indicatorBottomGap =
        metrics.dockBox.bottom - metrics.indicatorBox.bottom;

      expect(Math.abs(labelTopGap - labelBottomGap)).toBeLessThanOrEqual(1.5);
      expect(
        Math.abs(indicatorTopGap - indicatorBottomGap)
      ).toBeLessThanOrEqual(1.5);
      expect(
        Math.abs(metrics.labelBox.height - metrics.indicatorBox.height)
      ).toBeLessThanOrEqual(1.5);
    }
  });

  test('keeps compact shell and home v3 contract stable', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    const shellHeader = page.getByRole('banner');
    const primaryNav = page.locator('.mobile-bottom-nav');

    await expect(page.getByTestId('shell-network-status')).toBeVisible();
    await expect(
      shellHeader.getByRole('button', { name: 'Сканер' })
    ).toBeVisible();
    await expect(
      shellHeader.getByRole('link', { name: 'Буфер' })
    ).toBeVisible();
    await expect(
      shellHeader.getByRole('link', {
        name: 'Настройки',
      })
    ).toBeVisible();

    await page.getByTestId('shell-network-status').click();
    await expect(page.getByTestId('shell-network-popover')).toBeVisible();
    await page.getByTestId('shell-network-status').click();
    await expect(page.getByTestId('shell-network-popover')).not.toBeVisible();

    await expect(
      primaryNav.locator('[data-item-id="root.dashboard"]')
    ).toBeVisible();
    await expect(
      primaryNav.locator('[data-item-id="root.arrivals"]')
    ).toBeVisible();
    await expect(
      primaryNav.locator('[data-item-id="root.departures"]')
    ).toBeVisible();
    await expect(
      primaryNav.locator('[data-item-id="root.stocks"]')
    ).toBeVisible();
    await expect(
      primaryNav.locator('.mobile-bottom-nav__item[aria-current="page"]')
    ).toHaveCount(1);

    await expect(page.locator('.mobile-page-header')).toHaveCount(0);
    await expect(page.locator('.home-telemetry-row')).toHaveCount(5);
    await expect(page.locator('.home-favorite-tile')).toHaveCount(6);
    await expect(page.locator('.page-section__help-trigger')).toHaveCount(2);
    await expect(page.locator('.home-favorite-tile__description')).toHaveCount(
      0
    );
    await expect(
      page.locator('.mobile-page-sections').getByText('Связь')
    ).toHaveCount(0);
    await expect(page.locator('.mobile-page-sections h2')).toHaveCount(0);

    const homeGeometry = await page.evaluate(() => {
      const firstFavorite = document.querySelector('.home-favorite-tile');
      const footer = document.querySelector('.mobile-shell__footer');
      const mainRail = document.querySelector(
        '.mobile-shell__main .mobile-shell__rail'
      );

      return {
        firstFavoriteTop: firstFavorite?.getBoundingClientRect().top ?? 0,
        footerHeight: footer?.getBoundingClientRect().height ?? 0,
        mainRailWidth: mainRail?.getBoundingClientRect().width ?? 0,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      };
    });

    expect(homeGeometry.firstFavoriteTop).toBeLessThan(
      homeGeometry.viewportHeight - homeGeometry.footerHeight
    );
    expect(homeGeometry.mainRailWidth).toBeGreaterThanOrEqual(
      homeGeometry.viewportWidth - 32
    );

    await page.getByTestId('home-favorite-favorite-home-scanner').click();
    await expect(page.getByRole('dialog', { name: 'Сканер' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Сканер' })).toHaveCount(0);
    await expect(page.locator('.home-favorite-tile')).toHaveCount(6);

    await primaryNav.locator('[data-item-id="root.departures"]').click();
    await expect(page).toHaveURL(/#\/departures$/);
    await expect(page.getByTestId('departures-create-button')).toBeVisible();

    await primaryNav.locator('[data-item-id="root.stocks"]').click();
    await expect(page).toHaveURL(/#\/stocks$/);
    await expect(page.locator('.mobile-shell__title')).toBeVisible();

    const geometry = await page.evaluate(() => {
      const footer = document.querySelector('.mobile-shell__footer');
      const header = document.querySelector('.mobile-shell__header');
      const headerContent = document.querySelector(
        '.mobile-shell__header-content'
      );
      const mainRail = document.querySelector(
        '.mobile-shell__main .mobile-shell__rail'
      );
      const nav = document.querySelector('.mobile-bottom-nav');
      const section = document.querySelector('.page-section');
      const title = document.querySelector('.mobile-shell__title');

      return {
        footerTop: footer?.getBoundingClientRect().top ?? 0,
        headerBottom: header?.getBoundingClientRect().bottom ?? 0,
        headerContentBottom: headerContent?.getBoundingClientRect().bottom ?? 0,
        headerContentHeight: headerContent?.getBoundingClientRect().height ?? 0,
        headerContentTop: headerContent?.getBoundingClientRect().top ?? 0,
        headerHeight: header?.getBoundingClientRect().height ?? 0,
        headerTop: header?.getBoundingClientRect().top ?? 0,
        mainBottom:
          document.querySelector('.mobile-shell__main')?.getBoundingClientRect()
            .bottom ?? 0,
        mainRailWidth: mainRail?.getBoundingClientRect().width ?? 0,
        navTop: nav?.getBoundingClientRect().top ?? 0,
        sectionTop: section?.getBoundingClientRect().top ?? 0,
        titleBottom: title?.getBoundingClientRect().bottom ?? 0,
        titleTop: title?.getBoundingClientRect().top ?? 0,
        viewportWidth: window.innerWidth,
      };
    });

    expect(geometry.headerContentHeight).toBeLessThanOrEqual(
      geometry.headerHeight + 1
    );
    expect(geometry.headerContentTop).toBeGreaterThanOrEqual(
      geometry.headerTop
    );
    expect(geometry.sectionTop).toBeGreaterThanOrEqual(
      geometry.headerBottom - 1
    );
    expect(geometry.mainBottom).toBeGreaterThanOrEqual(geometry.footerTop);
    expect(geometry.footerTop).toBeGreaterThan(geometry.headerBottom);
    expect(geometry.navTop - geometry.footerTop).toBeLessThanOrEqual(2);
    expect(geometry.titleBottom).toBeGreaterThan(geometry.titleTop);
    expect(geometry.mainRailWidth).toBeGreaterThanOrEqual(
      geometry.viewportWidth - 32
    );

    fs.mkdirSync(screenshotRoot, { recursive: true });
    await page.screenshot({
      fullPage: true,
      path: path.join(screenshotRoot, 'home-navigation-flow.png'),
    });
  });
});
