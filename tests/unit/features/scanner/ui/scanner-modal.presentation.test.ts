import { describe, expect, it } from 'vitest';

import {
  getScannerErrorMessage,
  shouldDisplayScannerError,
} from '../../../../../src/features/scanner/modal/error-presentation.ts';
import { formatScannerFileSizeLabel } from '../../../../../src/features/scanner/modal/file-size-label.ts';
import {
  resolveDecodeFailedNotification,
  resolveDecodeSucceededNotification,
  resolveDecodeWarningNotification,
} from '../../../../../src/features/scanner/modal/notification-events.ts';
import {
  getScannerPermissionLabel,
  getScannerScanningLabel,
} from '../../../../../src/features/scanner/modal/status-presentation.tsx';

describe('scanner-modal.presentation', () => {
  it('maps machine-readable permission and scanning states to UI labels', () => {
    expect(getScannerPermissionLabel('prompt')).toBe('Запрос доступа');
    expect(getScannerScanningLabel('decoding')).toBe('Обработка');
    expect(getScannerScanningLabel('warning')).toBe('Дубликат');
  });

  it('maps session error codes to user-facing Russian messages', () => {
    expect(getScannerErrorMessage('file-too-large')).toBe(
      'Файл превышает допустимый размер для фото-сканирования.'
    );
    expect(getScannerErrorMessage('decode-failed')).toBe(
      'Код не удалось распознать. Повторите попытку или выберите другое изображение.'
    );
  });

  it('hides camera-only errors on the photo tab and formats file-size limits', () => {
    expect(shouldDisplayScannerError('photo', 'permission-denied')).toBe(false);
    expect(shouldDisplayScannerError('live', 'permission-denied')).toBe(true);
    expect(formatScannerFileSizeLabel(10 * 1024 * 1024)).toBe('10 МБ');
  });

  it('resolves scanner notification events without triggering effects', () => {
    expect(
      resolveDecodeFailedNotification({
        errorCode: 'decode-failed',
        opened: true,
        visibleTab: 'photo',
      })?.feedback.kind
    ).toBe('error');

    const successEvent = resolveDecodeSucceededNotification({
      lastNotificationKey: null,
      latestBufferItem: { source: 'scanner-photo', value: 'ABC-123' },
      opened: true,
      scanningStatus: 'success',
    });

    expect(successEvent?.notificationKey).toBe('scanner-photo:ABC-123');
    expect(
      resolveDecodeSucceededNotification({
        lastNotificationKey: 'scanner-photo:ABC-123',
        latestBufferItem: { source: 'scanner-photo', value: 'ABC-123' },
        opened: true,
        scanningStatus: 'success',
      })
    ).toBeNull();

    expect(
      resolveDecodeWarningNotification({
        lastNotificationKey: null,
        opened: true,
        scanningStatus: 'warning',
        statusMessage: 'duplicate',
      })?.feedback.kind
    ).toBe('warning');
  });
});
