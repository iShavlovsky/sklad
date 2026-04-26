import { expect, test } from '../fixtures';

type HelpGeometry = {
  boundaryWidth: number;
  dropdownLeft: number;
  dropdownRight: number;
  dropdownWidth: number;
  triggerWidth: number;
  viewportWidth: number;
};

async function openRoute(
  page: import('@playwright/test').Page,
  route: string
): Promise<void> {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('form')).toBeVisible();
}

async function openAccordionSection(
  page: import('@playwright/test').Page,
  title: string
): Promise<void> {
  const control = page
    .locator('.mantine-Accordion-control')
    .filter({ hasText: title })
    .first();

  await control.scrollIntoViewIfNeeded();
  await expect(control).toBeVisible();
  await control.click();
}

async function assertHelpPopoverGeometry(
  page: import('@playwright/test').Page,
  helpKey: string
): Promise<void> {
  const trigger = page
    .locator(`[data-help-trigger-key="${helpKey}"]`)
    .getByRole('button', { name: 'Открыть пояснение' });

  await trigger.scrollIntoViewIfNeeded();
  await expect(trigger).toBeVisible();
  await trigger.click();

  const dropdown = page.locator(`[data-help-dropdown-key="${helpKey}"]`);
  await expect(dropdown).toBeVisible();

  const geometry = await page.evaluate((key): HelpGeometry => {
    const triggerRoot = document.querySelector(
      `[data-help-trigger-key="${key}"]`
    ) as HTMLElement | null;
    const triggerButton = triggerRoot?.querySelector(
      'button'
    ) as HTMLElement | null;
    const boundary = triggerRoot?.closest(
      '[data-overlay-boundary], form'
    ) as HTMLElement | null;
    const dropdownNode = document.querySelector(
      `[data-help-dropdown-key="${key}"]`
    ) as HTMLElement | null;

    if (!triggerButton || !boundary || !dropdownNode) {
      throw new Error(`Missing help geometry nodes for ${key}`);
    }

    const boundaryRect = boundary.getBoundingClientRect();
    const triggerRect = triggerButton.getBoundingClientRect();
    const dropdownRect = dropdownNode.getBoundingClientRect();

    return {
      boundaryWidth: boundaryRect.width,
      dropdownLeft: dropdownRect.left,
      dropdownRight: dropdownRect.right,
      dropdownWidth: dropdownRect.width,
      triggerWidth: triggerRect.width,
      viewportWidth: window.innerWidth,
    };
  }, helpKey);

  expect(geometry.dropdownWidth).toBeGreaterThan(geometry.triggerWidth + 40);
  expect(geometry.dropdownWidth).toBeLessThanOrEqual(
    geometry.boundaryWidth + 1
  );
  expect(geometry.dropdownLeft).toBeGreaterThanOrEqual(0);
  expect(geometry.dropdownRight).toBeLessThanOrEqual(geometry.viewportWidth);

  await trigger.click();
  await expect(dropdown).not.toBeVisible();
}

test.describe('form help popovers on mobile', () => {
  test('arrival form keeps accordion help popover inside the form width', async ({
    page,
  }) => {
    await openRoute(page, '/#/arrivals/create');
    await assertHelpPopoverGeometry(page, 'section.additional.arrival');
  });

  test('departure form keeps section and field help popovers readable', async ({
    page,
  }) => {
    await openRoute(page, '/#/departures/create');
    await assertHelpPopoverGeometry(page, 'section.relation.departure');

    await openAccordionSection(page, 'Связь с приходом');
    await assertHelpPopoverGeometry(page, 'field.linkedArrival');
  });

  test('draft form keeps field and accordion help popovers inside the boundary', async ({
    page,
  }) => {
    await openRoute(page, '/#/drafts/create');
    await assertHelpPopoverGeometry(page, 'field.draftKind');
    await assertHelpPopoverGeometry(page, 'section.additional.draft');
  });
});
