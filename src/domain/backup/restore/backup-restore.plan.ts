import type { AppBackupPayload } from '../app-backup.payload.ts';

import type { BackupRestoreConflict } from './backup-restore.conflict.ts';
import type { BackupRestoreMode } from './backup-restore.mode.ts';

export interface BackupRestoreCommitPlan {
  readonly mode: BackupRestoreMode;
  readonly payload: AppBackupPayload;
  readonly currentState: AppBackupPayload;
  readonly targetState: AppBackupPayload;
  readonly historyWriteRequested: boolean;
  readonly checkpointWriteRequested: boolean;
  readonly checkpointLabel: string | null;
  readonly conflicts: BackupRestoreConflict[];
  readonly summary: string;
  readonly details: string | null;
}
