import type { ScannerDecodedPayload } from './contracts.ts';

export type ScannerRecoverableFailureCode =
  | 'NO_RESULT'
  | 'DECODE_FAILED'
  | 'FILE_TOO_LARGE'
  | 'FILE_UNSUPPORTED'
  | 'FILE_READ_FAILED'
  | 'CAMERA_PERMISSION_DENIED'
  | 'CAMERA_NOT_FOUND'
  | 'CAMERA_IN_USE'
  | 'SESSION_ABORTED'
  | 'SESSION_ALREADY_ACTIVE'
  | 'SESSION_NOT_ACTIVE';

export type ScannerFatalFailureCode =
  | 'BROWSER_UNSUPPORTED'
  | 'SECURE_CONTEXT_REQUIRED'
  | 'CAMERA_UNAVAILABLE'
  | 'SESSION_START_FAILED'
  | 'SESSION_STOP_FAILED'
  | 'UNKNOWN_FAILURE';

export interface ScannerDecodedResult {
  readonly ok: true;
  readonly code: 'DECODED';
  readonly value: ScannerDecodedPayload;
}

export interface ScannerNoResult<Code extends string = 'NO_RESULT'> {
  readonly ok: false;
  readonly code: Code;
  readonly kind: 'no-result';
  readonly recoverable: true;
  readonly message: string;
  readonly details: string | null;
}

export interface ScannerRecoverableFailure<Code extends string> {
  readonly ok: false;
  readonly code: Code;
  readonly kind: 'recoverable-failure';
  readonly recoverable: true;
  readonly message: string;
  readonly details: string | null;
}

export interface ScannerFatalFailure<Code extends string> {
  readonly ok: false;
  readonly code: Code;
  readonly kind: 'fatal-failure';
  readonly recoverable: false;
  readonly message: string;
  readonly details: string | null;
}

export type ScannerDecodeResult =
  | ScannerDecodedResult
  | ScannerNoResult
  | ScannerRecoverableFailure<
      Exclude<
        ScannerRecoverableFailureCode,
        'SESSION_ALREADY_ACTIVE' | 'SESSION_NOT_ACTIVE'
      >
    >
  | ScannerFatalFailure<
      Exclude<
        ScannerFatalFailureCode,
        'SESSION_START_FAILED' | 'SESSION_STOP_FAILED'
      >
    >;

/** Creates the success branch of the adapter result union used by the feature runtime. */
export function createScannerDecodedResult(
  value: ScannerDecodedPayload
): ScannerDecodedResult {
  return {
    ok: true,
    code: 'DECODED',
    value,
  };
}

export function createScannerNoResult(
  message = 'No decodable code was found',
  details: string | null = null
): ScannerNoResult {
  return {
    ok: false,
    code: 'NO_RESULT',
    kind: 'no-result',
    recoverable: true,
    message,
    details,
  };
}

export function createScannerRecoverableFailure<Code extends string>(
  code: Code,
  message: string,
  details: string | null = null
): ScannerRecoverableFailure<Code> {
  return {
    ok: false,
    code,
    kind: 'recoverable-failure',
    recoverable: true,
    message,
    details,
  };
}

export function createScannerFatalFailure<Code extends string>(
  code: Code,
  message: string,
  details: string | null = null
): ScannerFatalFailure<Code> {
  return {
    ok: false,
    code,
    kind: 'fatal-failure',
    recoverable: false,
    message,
    details,
  };
}

export function mapMediaErrorNameToScannerCode(
  errorName: string | null | undefined
): ScannerRecoverableFailureCode | ScannerFatalFailureCode {
  switch (errorName) {
    case 'AbortError':
    case 'InvalidStateError':
      return 'SESSION_ABORTED';
    case 'NotAllowedError':
      return 'CAMERA_PERMISSION_DENIED';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'CAMERA_NOT_FOUND';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'CAMERA_IN_USE';
    case 'SecurityError':
      return 'SECURE_CONTEXT_REQUIRED';
    default:
      return 'UNKNOWN_FAILURE';
  }
}

export function createScannerFileTooLargeFailure(input: {
  readonly actualSizeBytes: number;
  readonly maxSizeBytes: number;
  readonly fileName?: string | null;
}): ScannerRecoverableFailure<'FILE_TOO_LARGE'> {
  const label =
    input.fileName && input.fileName.trim().length > 0
      ? `File "${input.fileName}"`
      : 'Selected file';

  return createScannerRecoverableFailure(
    'FILE_TOO_LARGE',
    `${label} exceeds the supported size limit`,
    `actualSizeBytes=${input.actualSizeBytes}; maxSizeBytes=${input.maxSizeBytes}`
  );
}
