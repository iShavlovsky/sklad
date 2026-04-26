import type { AppBackupPayload } from '../app-backup.payload.ts';

import type { BackupRestoreCommitPlan } from './backup-restore.plan.ts';
import type { BackupRestoreReport } from './backup-restore.report.ts';

/**
 * Successful restore planning result.
 *
 * This does not mean the payload has been committed yet. Infrastructure
 * services still own the transaction, persistence, and history/checkpoint
 * writes.
 */
export interface BackupRestoreReadyResult {
  readonly ok: true;
  readonly payload: AppBackupPayload;
  readonly plan: BackupRestoreCommitPlan;
  readonly report: BackupRestoreReport;
}

/**
 * Blocked restore planning result returned before any durable writes happen.
 */
export interface BackupRestoreBlockedResult {
  readonly ok: false;
  readonly code: 'INVALID_PAYLOAD' | 'UNSUPPORTED_VERSION' | 'CONFLICT';
  readonly report: BackupRestoreReport;
}

/**
 * Planner-level result union for backup restore.
 */
export type BackupRestoreResult =
  | BackupRestoreReadyResult
  | BackupRestoreBlockedResult;
