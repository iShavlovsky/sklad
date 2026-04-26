import {
  BarcodeFormat,
  ChecksumException,
  FormatException,
  NotFoundException,
  Result,
} from '@zxing/library';
import { describe, expect, it } from 'vitest';

import {
  createScannerResultFromZxingResult,
  mapZxingDecodeErrorToResult,
} from '../../../../../src/infrastructure/browser/scanner/zxing/error-mapping.ts';

describe('zxing-error-mapping', () => {
  it('maps ZXing not-found errors into explicit no-result outcomes', () => {
    const result = mapZxingDecodeErrorToResult(
      NotFoundException.getNotFoundInstance()
    );

    expect(result).toEqual({
      ok: false,
      code: 'NO_RESULT',
      kind: 'no-result',
      recoverable: true,
      message: 'No decodable code was found',
      details: null,
    });
  });

  it('maps ZXing format and checksum errors into recoverable decode failures', () => {
    const formatFailure = mapZxingDecodeErrorToResult(
      FormatException.getFormatInstance()
    );
    const checksumFailure = mapZxingDecodeErrorToResult(
      ChecksumException.getChecksumInstance()
    );

    expect(formatFailure.code).toBe('DECODE_FAILED');
    expect(checksumFailure.code).toBe('DECODE_FAILED');
    expect(formatFailure.kind).toBe('recoverable-failure');
    expect(checksumFailure.kind).toBe('recoverable-failure');
  });

  it('maps browser abort-style errors into session-aborted outcomes', () => {
    const result = mapZxingDecodeErrorToResult(
      new DOMException('Aborted', 'AbortError')
    );

    expect(result).toMatchObject({
      ok: false,
      code: 'SESSION_ABORTED',
      kind: 'recoverable-failure',
    });
  });

  it('creates decoded payloads with stable format naming', () => {
    const zxingResult = new Result(
      'QR-123',
      new Uint8Array(),
      0,
      [],
      BarcodeFormat.QR_CODE
    );

    expect(
      createScannerResultFromZxingResult(
        zxingResult,
        'scanner-photo',
        '2026-04-21T18:30:00.000Z'
      )
    ).toEqual({
      ok: true,
      code: 'DECODED',
      value: {
        value: 'QR-123',
        capturedAt: '2026-04-21T18:30:00.000Z',
        format: 'QR_CODE',
        source: 'scanner-photo',
      },
    });
  });
});
