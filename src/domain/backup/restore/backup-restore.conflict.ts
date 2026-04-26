import type { RestoreConflictCode } from '@/infrastructure/restore-core';

export type BackupRestoreTableName =
  | 'suppliers'
  | 'categories'
  | 'products'
  | 'arrivals'
  | 'departures'
  | 'drafts'
  | 'recordCodes'
  | 'settings'
  | 'favorites'
  | 'profiles'
  | 'backupCheckpoints'
  | 'backupHistory';

export type BackupRestoreConflictScope =
  | 'payload'
  | 'version'
  | 'records'
  | 'checkpoint'
  | 'history'
  | 'commit';

export type BackupRestoreConflictCode =
  | RestoreConflictCode
  | 'INVALID_PAYLOAD'
  | 'UNSUPPORTED_VERSION'
  | 'VERSION_MISMATCH'
  | 'MERGE_CONFLICT'
  | 'REBASE_CONFLICT'
  | 'CHECKPOINT_CONFLICT'
  | 'HISTORY_CONFLICT'
  | 'WRITE_BLOCKED';

export interface BackupRestoreConflict {
  readonly table: BackupRestoreTableName;
  readonly recordId: string;
  readonly scope: BackupRestoreConflictScope;
  readonly path: string;
  readonly code: BackupRestoreConflictCode;
  readonly message: string;
}
