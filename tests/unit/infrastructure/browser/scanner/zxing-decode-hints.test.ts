import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { describe, expect, it } from 'vitest';

import {
  createZxingDecodeHints,
  formatBarcodeFormatName,
  resolveZxingFormats,
  ZXING_SUPPORTED_FORMATS,
} from '../../../../../src/infrastructure/browser/scanner/zxing/decode-hints.ts';

describe('zxing-decode-hints', () => {
  it('uses broad supported-format coverage by default', () => {
    expect(resolveZxingFormats()).toEqual([...ZXING_SUPPORTED_FORMATS]);
  });

  it('maps friendly format aliases into ZXing barcode formats and de-duplicates them', () => {
    expect(
      resolveZxingFormats(['qr', 'qr-code', 'ean-13', 'PDF417', 'unknown'])
    ).toEqual([
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.PDF_417,
    ]);
  });

  it('falls back to broad coverage when requested format names are all unknown', () => {
    expect(resolveZxingFormats(['definitely-unknown'])).toEqual([
      ...ZXING_SUPPORTED_FORMATS,
    ]);
  });

  it('creates decode hints with possible formats and optional try-harder', () => {
    const hints = createZxingDecodeHints({
      formats: ['qr-code', 'code-128'],
      tryHarder: true,
    });

    expect(hints.get(DecodeHintType.POSSIBLE_FORMATS)).toEqual([
      BarcodeFormat.QR_CODE,
      BarcodeFormat.CODE_128,
    ]);
    expect(hints.get(DecodeHintType.TRY_HARDER)).toBe(true);
  });

  it('formats barcode format names into stable contract strings', () => {
    expect(formatBarcodeFormatName(BarcodeFormat.DATA_MATRIX)).toBe(
      'DATA_MATRIX'
    );
    expect(formatBarcodeFormatName(null)).toBeNull();
  });
});
