import path from 'path';

import { expect, test } from '../fixtures';

const ZXING_BROWSER_UMD_PATH = path.join(
  process.cwd(),
  'node_modules/@zxing/browser/umd/zxing-browser.js'
);

async function generateQrPngBase64(
  page: import('@playwright/test').Page,
  contents: string
): Promise<string> {
  await page.addScriptTag({ path: ZXING_BROWSER_UMD_PATH });

  return page.evaluate(async (text: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ZXingBrowser = (window as any).ZXingBrowser as any;
    const svgElement: SVGElement =
      new ZXingBrowser.BrowserQRCodeSvgWriter().write(text, 320, 320);

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    return new Promise<string>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 320;
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('canvas 2d unavailable'));
          return;
        }

        context.fillStyle = 'white';
        context.fillRect(0, 0, 320, 320);
        context.drawImage(image, 0, 0, 320, 320);
        URL.revokeObjectURL(url);
        resolve(
          canvas.toDataURL('image/png').replace('data:image/png;base64,', '')
        );
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('SVG-to-PNG conversion failed'));
      };
      image.src = url;
    });
  }, contents);
}

test.describe('scanner modal UI', () => {
  test('photo pipeline keeps QR decodable after crop transforms', async ({
    page,
  }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    const variants = await page.evaluate(async () => {
      const [
        { createPhotoScannerAdapter },
        { createCroppedImageFile },
        zxingBrowserModule,
      ] = await Promise.all([
        // @ts-expect-error Browser-side Vite module resolution in page context
        import('/src/infrastructure/browser/scanner/adapters/photo.ts'),
        // @ts-expect-error Browser-side Vite module resolution in page context
        import('/src/shared/lib/media/image-transform.ts'),
        // @ts-expect-error Browser-side Vite module resolution in page context
        import('/node_modules/@zxing/browser/umd/zxing-browser.js'),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ZXingBrowser = (window as any).ZXingBrowser ?? zxingBrowserModule;
      const svg = new ZXingBrowser.BrowserQRCodeSvgWriter().write(
        'MCP-SCAN-ROT-001',
        320,
        320
      );
      const svgString = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const renderBlob = async (mimeType: string): Promise<Blob> => {
        return await new Promise((resolve, reject) => {
          const image = new Image();

          image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 320;
            canvas.height = 320;
            const context = canvas.getContext('2d');

            if (!context) {
              reject(new Error('canvas 2d unavailable'));
              return;
            }

            context.fillStyle = 'white';
            context.fillRect(0, 0, 320, 320);
            context.drawImage(image, 0, 0, 320, 320);
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('render blob unavailable'));
                return;
              }

              resolve(blob);
            }, mimeType);
          };
          image.onerror = () => reject(new Error('image render failed'));
          image.src = svgUrl;
        });
      };

      const pngBlob = await renderBlob('image/png');
      const jpegBlob = await renderBlob('image/jpeg');
      URL.revokeObjectURL(svgUrl);

      const adapter = createPhotoScannerAdapter();
      const sourceFiles = [
        new File([pngBlob], 'qr.png', { type: 'image/png' }),
        new File([jpegBlob], 'qr.jpg', { type: 'image/jpeg' }),
      ];
      const results: Array<{
        sourceType: string;
        variant: string;
        ok: boolean;
        code: string;
      }> = [];

      for (const file of sourceFiles) {
        const objectUrl = URL.createObjectURL(file);

        try {
          for (const variant of [
            { name: 'plain', rotation: 0, flipX: false, flipY: false },
            { name: 'rot90', rotation: 90, flipX: false, flipY: false },
            { name: 'rot180', rotation: 180, flipX: false, flipY: false },
            { name: 'flipX', rotation: 0, flipX: true, flipY: false },
            { name: 'flipY', rotation: 0, flipX: false, flipY: true },
          ]) {
            const cropped = await createCroppedImageFile({
              crop: { x: 0, y: 0, width: 320, height: 320 },
              fileName: `${variant.name}-${file.name}`,
              flipX: variant.flipX,
              flipY: variant.flipY,
              imageUrl: objectUrl,
              mimeType: file.type,
              rotation: variant.rotation,
            });
            const decoded = await adapter.decodeFile({ file: cropped });

            results.push({
              sourceType: file.type,
              variant: variant.name,
              ok: decoded.ok,
              code: decoded.code,
            });
          }
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      }

      return results;
    });

    expect(variants).toHaveLength(10);

    for (const variant of variants) {
      expect(variant.ok, `${variant.sourceType}:${variant.variant}`).toBe(true);
      expect(variant.code, `${variant.sourceType}:${variant.variant}`).toBe(
        'DECODED'
      );
    }
  });

  test('shell flow keeps route context when scanner closes', async ({
    page,
  }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');
    const shellHeader = page.getByRole('banner');

    await expect(
      shellHeader.getByRole('button', { name: 'Сканер' })
    ).toBeVisible();
    await expect(
      shellHeader.getByRole('button', { name: 'Меню' })
    ).toBeVisible();

    await shellHeader.getByRole('link', { name: 'Буфер' }).click();
    await expect(page).toHaveURL(/#\/buffer$/);
    await expect(
      page.getByRole('banner').getByText('Буфер', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('main').getByLabel('Список буфера')
    ).toBeVisible();

    await shellHeader.getByRole('button', { name: 'Меню' }).click();
    const shellMenu = page.getByRole('dialog', { name: 'Меню' });
    await expect(shellMenu).toBeVisible();
    await shellMenu.getByRole('link', { name: /Настройки/ }).click();
    await expect(page).toHaveURL(/#\/settings$/);
    await expect(
      page.getByRole('banner').getByText('Настройки', { exact: true })
    ).toBeVisible();

    await shellHeader.getByRole('button', { name: 'Сканер' }).click();
    await expect(page.getByRole('dialog', { name: 'Сканер' })).toBeVisible();

    await page.locator('.mantine-Modal-close').click();

    await expect(page.getByRole('dialog', { name: 'Сканер' })).toBeHidden();
    await expect(page).toHaveURL(/#\/settings$/);
    await expect(
      page.getByRole('banner').getByText('Настройки', { exact: true })
    ).toBeVisible();
  });

  test('modal open-close does not break layout state', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');
    const shellHeader = page.getByRole('banner');

    await shellHeader.getByRole('button', { name: 'Сканер' }).click();
    await expect(page.getByRole('dialog', { name: 'Сканер' })).toBeVisible();

    await page.locator('.mantine-Modal-close').click();
    await expect(page.getByRole('dialog', { name: 'Сканер' })).toBeHidden();
  });

  test('scanner modal opens fullscreen without side gaps', async ({
    page,
  }, testInfo) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');
    const shellHeader = page.getByRole('banner');

    await shellHeader.getByRole('button', { name: 'Сканер' }).click();

    const dialog = page.getByRole('dialog', { name: 'Сканер' });
    await expect(dialog).toBeVisible();

    const metrics = await page.evaluate(() => {
      const dialogElement = document.querySelector(
        '[role="dialog"]'
      ) as HTMLElement | null;
      const contentElement = document.querySelector(
        '.scanner-modal'
      ) as HTMLElement | null;
      const bodyElement = document.body;

      if (!dialogElement || !contentElement) {
        return null;
      }

      const dialogRect = dialogElement.getBoundingClientRect();
      const contentRect = contentElement.getBoundingClientRect();

      return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        dialog: {
          top: dialogRect.top,
          left: dialogRect.left,
          width: dialogRect.width,
          height: dialogRect.height,
          rightGap: window.innerWidth - dialogRect.right,
          bottomGap: window.innerHeight - dialogRect.bottom,
        },
        content: {
          top: contentRect.top,
          left: contentRect.left,
          width: contentRect.width,
          height: contentRect.height,
          rightGap: window.innerWidth - contentRect.right,
          bottomGap: window.innerHeight - contentRect.bottom,
        },
        body: {
          clientWidth: bodyElement.clientWidth,
          clientHeight: bodyElement.clientHeight,
          scrollHeight: bodyElement.scrollHeight,
        },
      };
    });

    expect(metrics).not.toBeNull();
    expect(metrics?.dialog.left).toBeLessThanOrEqual(1);
    expect(metrics?.dialog.top).toBeLessThanOrEqual(1);
    expect(metrics?.dialog.rightGap).toBeLessThanOrEqual(1);
    expect(metrics?.dialog.bottomGap).toBeLessThanOrEqual(1);
    expect(metrics?.dialog.width).toBeGreaterThanOrEqual(
      (metrics?.viewportWidth ?? 0) - 1
    );
    expect(metrics?.dialog.height).toBeGreaterThanOrEqual(
      (metrics?.viewportHeight ?? 0) - 1
    );
    expect(metrics?.content.left).toBeLessThanOrEqual(1);
    expect(metrics?.content.top).toBeLessThanOrEqual(1);
    expect(metrics?.content.rightGap).toBeLessThanOrEqual(1);
    expect(metrics?.content.bottomGap).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: testInfo.outputPath('scanner-modal-fullscreen.png'),
      fullPage: false,
    });
  });

  test('scanner header status pills keep readable width on mobile', async ({
    page,
  }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Сканер' })
      .click();

    await expect(page.getByRole('dialog', { name: 'Сканер' })).toBeVisible();

    const metrics = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>(
        '.scanner-modal__header'
      );
      const status = document.querySelector<HTMLElement>(
        '.scanner-modal__header-status'
      );
      const pills = Array.from(
        document.querySelectorAll<HTMLElement>('.scanner-modal__status-pill')
      );
      const labels = Array.from(
        document.querySelectorAll<HTMLElement>(
          '.scanner-modal__status-pill-label'
        )
      );
      const headerStyles = header ? getComputedStyle(header) : null;

      return {
        headerWidth: header?.getBoundingClientRect().width ?? 0,
        statusWidth: status?.getBoundingClientRect().width ?? 0,
        pillWidths: pills.map((pill) => pill.getBoundingClientRect().width),
        pillBackgrounds: pills.map((pill) => getComputedStyle(pill).background),
        pillBorderColors: pills.map(
          (pill) => getComputedStyle(pill).borderColor
        ),
        pillColors: pills.map((pill) => getComputedStyle(pill).color),
        pillTones: pills.map((pill) => pill.dataset.tone ?? ''),
        headerBackground: headerStyles?.background ?? '',
        labelWidths: labels.map((label) => label.getBoundingClientRect().width),
        labelColors: labels.map((label) => getComputedStyle(label).color),
      };
    });

    expect(metrics.headerWidth).toBeGreaterThan(0);
    expect(metrics.statusWidth).toBeGreaterThanOrEqual(
      metrics.headerWidth - 90
    );
    expect(metrics.pillWidths).toHaveLength(2);
    expect(metrics.labelWidths).toHaveLength(2);
    expect(metrics.pillBackgrounds).toHaveLength(2);
    expect(metrics.pillBorderColors).toHaveLength(2);
    expect(metrics.pillColors).toHaveLength(2);
    expect(metrics.pillTones).toHaveLength(2);
    expect(metrics.labelColors).toHaveLength(2);

    for (const width of metrics.pillWidths) {
      expect(width).toBeGreaterThanOrEqual(metrics.statusWidth * 0.42);
    }

    for (const width of metrics.labelWidths) {
      expect(width).toBeGreaterThanOrEqual(48);
    }

    for (const [index, tone] of metrics.pillTones.entries()) {
      expect(tone).toBeTruthy();
      expect(metrics.pillBackgrounds[index]).not.toBe('rgba(0, 0, 0, 0)');
      expect(metrics.pillBackgrounds[index]).not.toBe(metrics.headerBackground);
      expect(metrics.pillBorderColors[index]).not.toBe('rgba(0, 0, 0, 0)');
      expect(metrics.labelColors[index]).toBe(metrics.pillColors[index]);
    }
  });

  test('photo tab decodes QR and writes it into buffer', async ({ page }) => {
    const expectedCode = 'ZXING-SCANNER-UI-001';

    await page.goto('/#/');
    await page.waitForLoadState('networkidle');
    const shellHeader = page.getByRole('banner');

    const qrBase64 = await generateQrPngBase64(page, expectedCode);
    const pngBuffer = Buffer.from(qrBase64, 'base64');

    await shellHeader.getByRole('button', { name: 'Сканер' }).click();
    await page.getByRole('tab', { name: 'Файл' }).click();

    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'scanner-qr.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    });

    await expect(
      page.getByRole('button', { name: 'Сканировать' })
    ).toBeEnabled();
    const duplicateScanButton = page.getByRole('button', {
      name: 'Сканировать',
    });
    await expect(duplicateScanButton).toBeEnabled();
    await duplicateScanButton.click();

    await expect(
      page
        .locator('.scanner-modal__inline-state--success')
        .getByText(expectedCode)
    ).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator('.scanner-modal__inline-state')).toHaveCount(1);
    await expect(page.locator('.mantine-Notification-root')).toHaveCount(0);
    const persistedBuffer = await page.evaluate(() => {
      const rawValue = localStorage.getItem('sklad-buffer');
      if (rawValue === null) {
        return null;
      }

      return JSON.parse(rawValue);
    });

    expect(persistedBuffer?.state?.items).toHaveLength(1);
    expect(persistedBuffer?.state?.items?.[0]?.value).toBe(expectedCode);
  });

  test('duplicate decoded code stays warning-only and shows existing buffer item details', async ({
    page,
  }) => {
    const expectedCode = `ZXING-DUPLICATE-${Date.now()}`;

    await page.goto('/#/');
    await page.waitForLoadState('networkidle');
    const shellHeader = page.getByRole('banner');

    const qrBase64 = await generateQrPngBase64(page, expectedCode);
    const pngBuffer = Buffer.from(qrBase64, 'base64');

    await shellHeader.getByRole('button', { name: 'Сканер' }).click();
    await page.getByRole('tab', { name: 'Файл' }).click();

    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'scanner-duplicate-qr.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    });

    const duplicateScanButton = page.getByRole('button', {
      name: 'Сканировать',
    });
    await expect(duplicateScanButton).toBeEnabled();
    await duplicateScanButton.click();
    await expect(
      page
        .locator('.scanner-modal__inline-state--success')
        .getByText(expectedCode)
    ).toBeVisible({
      timeout: 10_000,
    });

    await expect(duplicateScanButton).toBeEnabled();
    await duplicateScanButton.click();

    await expect(page.locator('.scanner-modal__inline-state')).toHaveCount(1);
    await expect(page.locator('.mantine-Notification-root')).toHaveCount(0);
    await expect(
      page
        .locator('.scanner-modal__inline-state--warning')
        .getByText(expectedCode)
    ).toBeVisible();
    await expect(
      page.getByText(
        'Код не удалось распознать. Повторите попытку или выберите другое изображение.'
      )
    ).toBeHidden();

    const persistedBuffer = await page.evaluate(() => {
      const rawValue = localStorage.getItem('sklad-buffer');
      if (rawValue === null) {
        return null;
      }

      return JSON.parse(rawValue);
    });

    expect(persistedBuffer?.state?.items).toHaveLength(1);
    expect(persistedBuffer?.state?.items?.[0]?.value).toBe(expectedCode);
  });

  test('photo tab rejects files above the limit', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');
    const shellHeader = page.getByRole('banner');

    await shellHeader.getByRole('button', { name: 'Сканер' }).click();
    await page.getByRole('tab', { name: 'Файл' }).click();

    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles({
        name: 'too-large.png',
        mimeType: 'image/png',
        buffer: Buffer.alloc(10 * 1024 * 1024 + 1, 1),
      });
    await page.getByRole('button', { name: 'Сканировать' }).click();

    await expect(
      page.getByText('Файл превышает допустимый размер для фото-сканирования.')
    ).toBeVisible();
    await expect(page.locator('.scanner-modal__inline-state')).toHaveCount(1);
    await expect(page.locator('.mantine-Notification-root')).toHaveCount(0);
  });

  test('photo tab keeps tabs in one row and selected image editor fills the panel', async ({
    page,
  }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    const qrBase64 = await generateQrPngBase64(page, 'PHOTO-LAYOUT-DEBUG');
    const pngBuffer = Buffer.from(qrBase64, 'base64');

    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Сканер' })
      .click();
    await page.getByRole('tab', { name: 'Файл' }).click();
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'photo-layout-debug.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    });

    const metrics = await page.evaluate(() => {
      const tabs = Array.from(
        document.querySelectorAll('.scanner-modal__tab')
      ) as HTMLElement[];
      const editor = document.querySelector(
        '.scanner-photo-editor'
      ) as HTMLElement | null;
      const cropper = document.querySelector(
        '.scanner-photo-editor__cropper'
      ) as HTMLElement | null;
      const controls = document.querySelector(
        '.scanner-photo-editor__controls'
      ) as HTMLElement | null;

      return {
        tabTops: tabs.map((tab) => Math.round(tab.getBoundingClientRect().top)),
        tabWidths: tabs.map((tab) =>
          Math.round(tab.getBoundingClientRect().width)
        ),
        fileInputCount: document.querySelectorAll('#scanner-photo-file-input')
          .length,
        editorHeight: editor?.getBoundingClientRect().height ?? null,
        cropperHeight: cropper?.getBoundingClientRect().height ?? null,
        controlsHeight: controls?.getBoundingClientRect().height ?? null,
      };
    });

    expect(new Set(metrics.tabTops).size).toBe(1);
    expect(metrics.tabWidths[0]).toBe(metrics.tabWidths[1]);
    expect(metrics.fileInputCount).toBe(0);
    expect(metrics.editorHeight).not.toBeNull();
    expect(metrics.cropperHeight).not.toBeNull();
    expect(metrics.controlsHeight).not.toBeNull();
    expect(metrics.cropperHeight).toBeGreaterThan(0);
  });

  test('scanner reopens on the previously selected tab from second data', async ({
    page,
  }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');
    const shellHeader = page.getByRole('banner');

    await shellHeader.getByRole('button', { name: 'Сканер' }).click();
    await page.getByRole('tab', { name: 'Файл' }).click();
    await expect(
      page.getByRole('tab', { name: 'Файл', selected: true })
    ).toBeVisible();
    await page.locator('.scanner-modal__close-action').click();
    await expect(page.getByRole('dialog', { name: 'Сканер' })).toBeHidden();

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Сканер' })
      .click();

    await expect(
      page.getByRole('tab', { name: 'Файл', selected: true })
    ).toBeVisible();

    const persistedPreferences = await page.evaluate(() => {
      const rawValue = localStorage.getItem('sklad-scanner-preferences');
      return rawValue === null ? null : JSON.parse(rawValue);
    });

    expect(persistedPreferences?.state?.preferredTab).toBe('photo');
  });

  test('footer close action closes scanner modal', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');
    const shellHeader = page.getByRole('banner');

    await shellHeader.getByRole('button', { name: 'Сканер' }).click();
    await expect(page.getByRole('dialog', { name: 'Сканер' })).toBeVisible();

    await page.locator('.scanner-modal__close-action').click();

    await expect(page.getByRole('dialog', { name: 'Сканер' })).toBeHidden();
  });
});
