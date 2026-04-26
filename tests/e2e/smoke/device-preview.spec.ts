import { expect, test } from '../fixtures';

test.describe('device preview route', () => {
  test('renders a compact two-column surface with a working preset switcher', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });
    await page.goto('/#/device-preview?target=/settings');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: 'Device Preview' })
    ).toBeVisible();
    await expect(page.getByLabel('Пресет телефона')).toHaveValue(
      'samsung-galaxy-s21-s24'
    );
    await expect(page.getByLabel('DPR')).toHaveValue('3');

    const iframe = page.getByTestId('device-preview-iframe');
    await expect(iframe).toHaveAttribute('src', '/#/settings');

    const iframeBox = await iframe.boundingBox();

    expect(iframeBox).not.toBeNull();
    expect(iframeBox?.width ?? 0).toBeCloseTo(360, 0);
    expect(iframeBox?.height ?? 0).toBeCloseTo(800, 0);

    await page.getByLabel('Пресет телефона').click();
    await page.getByRole('option', { name: 'iPhone 14 Pro' }).click();

    await expect(page.getByLabel('DPR')).toHaveValue('3');

    const resizedIframeBox = await iframe.boundingBox();
    expect(resizedIframeBox).not.toBeNull();
    expect(resizedIframeBox?.width ?? 0).toBeCloseTo(393, 0);
    expect(resizedIframeBox?.height ?? 0).toBeCloseTo(852, 0);

    const previewApp = page.frameLocator(
      '[data-testid="device-preview-iframe"]'
    );
    await expect(
      previewApp.getByRole('heading', { name: 'Настройки', exact: true })
    ).toBeVisible();
  });
});
