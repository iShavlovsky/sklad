import {
  ChecksumException,
  FormatException,
  NotFoundException,
  type Result,
} from '@zxing/library';

import type { ScannerDecodedSource } from '../contracts/contracts.ts';
import {
  createScannerDecodedResult,
  createScannerFatalFailure,
  createScannerNoResult,
  createScannerRecoverableFailure,
  mapMediaErrorNameToScannerCode,
  type ScannerDecodeResult,
  type ScannerFatalFailureCode,
  type ScannerRecoverableFailureCode,
} from '../contracts/decode-result.ts';

import { formatBarcodeFormatName } from './decode-hints.ts';

type ScannerDecodeRecoverableCode =
  | 'DECODE_FAILED'
  | 'CAMERA_PERMISSION_DENIED'
  | 'CAMERA_NOT_FOUND'
  | 'CAMERA_IN_USE'
  | 'SESSION_ABORTED';

type ScannerDecodeFatalCode =
  | 'BROWSER_UNSUPPORTED'
  | 'SECURE_CONTEXT_REQUIRED'
  | 'CAMERA_UNAVAILABLE'
  | 'UNKNOWN_FAILURE';

function getErrorName(error: unknown): string | null {
  if (error instanceof Error && error.name.trim().length > 0) {
    return error.name;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    typeof (error as { name: unknown }).name === 'string'
  ) {
    return (error as { name: string }).name;
  }

  return null;
}

function getErrorKind(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'kind' in error &&
    typeof (error as { kind: unknown }).kind === 'string'
  ) {
    return (error as { kind: string }).kind;
  }

  return null;
}

function getErrorDetails(error: unknown): string | null {
  if (error instanceof Error) {
    return typeof error.message === 'string' && error.message.trim().length > 0
      ? error.message
      : null;
  }

  return typeof error === 'string' && error.trim().length > 0 ? error : null;
}

function isNamedError(error: unknown, expectedName: string): boolean {
  return (
    error instanceof Error &&
    (error.name === expectedName || getErrorKind(error) === expectedName)
  );
}

function isRecoverableScannerCode(
  code: ScannerRecoverableFailureCode | ScannerFatalFailureCode
): code is Extract<
  ScannerRecoverableFailureCode,
  | 'CAMERA_PERMISSION_DENIED'
  | 'CAMERA_NOT_FOUND'
  | 'CAMERA_IN_USE'
  | 'SESSION_ABORTED'
> {
  return (
    code === 'CAMERA_PERMISSION_DENIED' ||
    code === 'CAMERA_NOT_FOUND' ||
    code === 'CAMERA_IN_USE' ||
    code === 'SESSION_ABORTED'
  );
}

export function createScannerResultFromZxingResult(
  result: Result,
  source: ScannerDecodedSource,
  capturedAt: string = new Date().toISOString()
) {
  return createScannerDecodedResult({
    value: result.getText(),
    capturedAt,
    format: formatBarcodeFormatName(result.getBarcodeFormat()),
    source,
  });
}

export function mapZxingDecodeErrorToResult(
  error: unknown
): Exclude<ScannerDecodeResult, { ok: true }> {
  if (
    error instanceof NotFoundException ||
    isNamedError(error, 'NotFoundException')
  ) {
    return createScannerNoResult();
  }

  if (
    error instanceof ChecksumException ||
    error instanceof FormatException ||
    isNamedError(error, 'ChecksumException') ||
    isNamedError(error, 'FormatException')
  ) {
    return createScannerRecoverableFailure(
      'DECODE_FAILED',
      'ZXing could not decode a supported code from the provided image',
      getErrorDetails(error)
    );
  }

  const mediaErrorCode = mapMediaErrorNameToScannerCode(
    getErrorName(error) ?? getErrorKind(error)
  );
  if (isRecoverableScannerCode(mediaErrorCode)) {
    return createScannerRecoverableFailure(
      mediaErrorCode as ScannerDecodeRecoverableCode,
      'Scanner browser interaction failed',
      getErrorDetails(error)
    );
  }

  const fatalCode: ScannerDecodeFatalCode =
    mediaErrorCode === 'SECURE_CONTEXT_REQUIRED' ||
    mediaErrorCode === 'BROWSER_UNSUPPORTED' ||
    mediaErrorCode === 'CAMERA_UNAVAILABLE'
      ? mediaErrorCode
      : 'UNKNOWN_FAILURE';

  return createScannerFatalFailure(
    fatalCode,
    'Scanner decode failed with an unexpected browser or engine error',
    getErrorDetails(error)
  );
}
