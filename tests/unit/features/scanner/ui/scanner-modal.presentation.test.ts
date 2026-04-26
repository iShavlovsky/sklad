import { describe, expect, it } from 'vitest';

import {
  getScannerErrorMessage,
  shouldDisplayScannerError,
} from '../../../../../src/features/scanner-runtime/ui/scanner-modal/error-presentation.ts';
import { formatScannerFileSizeLabel } from '../../../../../src/features/scanner-runtime/ui/scanner-modal/file-size-label.ts';
import {
  getScannerPermissionLabel,
  getScannerScanningLabel,
} from '../../../../../src/features/scanner-runtime/ui/scanner-modal/status-presentation.tsx';

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
});
