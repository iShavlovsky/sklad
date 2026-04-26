import type { AppBackupPayload } from '../app-backup.payload.ts';

import type { BackupImportReport } from './backup-import.report.ts';

/**
 * Successful payload validation result for backup import.
 */
export interface BackupImportValidationSuccess {
  readonly ok: true;
  readonly payload: AppBackupPayload;
  readonly report: BackupImportReport;
}

/**
 * Failed payload validation result for backup import.
 */
export interface BackupImportValidationFailure {
  readonly ok: false;
  readonly code: 'INVALID_PAYLOAD' | 'UNSUPPORTED_VERSION';
  readonly report: BackupImportReport;
}

/**
 * Validation union produced before restore planning starts.
 */
export type BackupImportValidationResult =
  | BackupImportValidationSuccess
  | BackupImportValidationFailure;
