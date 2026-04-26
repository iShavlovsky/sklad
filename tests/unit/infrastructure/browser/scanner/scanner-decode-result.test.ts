import { describe, expect, it } from 'vitest';

import {
  createScannerFatalFailure,
  createScannerFileTooLargeFailure,
  createScannerNoResult,
  createScannerRecoverableFailure,
  mapMediaErrorNameToScannerCode,
} from '../../../../../src/infrastructure/browser/scanner/contracts/decode-result.ts';

describe('scanner-decode-result', () => {
  it('maps known media errors into stable machine-readable scanner codes', () => {
    expect(mapMediaErrorNameToScannerCode('NotAllowedError')).toBe(
      'CAMERA_PERMISSION_DENIED'
    );
    expect(mapMediaErrorNameToScannerCode('NotReadableError')).toBe(
      'CAMERA_IN_USE'
    );
    expect(mapMediaErrorNameToScannerCode('OverconstrainedError')).toBe(
      'CAMERA_NOT_FOUND'
    );
    expect(mapMediaErrorNameToScannerCode('SecurityError')).toBe(
      'SECURE_CONTEXT_REQUIRED'
    );
  });

  it('falls back to UNKNOWN_FAILURE for unmapped browser errors', () => {
    expect(mapMediaErrorNameToScannerCode('WeirdBrowserError')).toBe(
      'UNKNOWN_FAILURE'
    );
    expect(mapMediaErrorNameToScannerCode(null)).toBe('UNKNOWN_FAILURE');
  });

  it('creates a recoverable file-too-large failure with machine-readable size details', () => {
    const result = createScannerFileTooLargeFailure({
      fileName: 'scan.png',
      actualSizeBytes: 5_000_000,
      maxSizeBytes: 2_000_000,
    });

    expect(result).toEqual({
      ok: false,
      code: 'FILE_TOO_LARGE',
      kind: 'recoverable-failure',
      recoverable: true,
      message: 'File "scan.png" exceeds the supported size limit',
      details: 'actualSizeBytes=5000000; maxSizeBytes=2000000',
    });
  });

  it('keeps no-result, recoverable failure, and fatal failure shapes distinct', () => {
    const noResult = createScannerNoResult();
    const recoverable = createScannerRecoverableFailure(
      'DECODE_FAILED',
      'Decode failed'
    );
    const fatal = createScannerFatalFailure(
      'BROWSER_UNSUPPORTED',
      'Browser APIs are unavailable'
    );

    expect(noResult.kind).toBe('no-result');
    expect(recoverable.kind).toBe('recoverable-failure');
    expect(fatal.kind).toBe('fatal-failure');
    expect(noResult.recoverable).toBe(true);
    expect(recoverable.recoverable).toBe(true);
    expect(fatal.recoverable).toBe(false);
  });
});
