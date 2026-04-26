import type { AppBackupPayload } from '../app-backup.payload.ts';

import type { BackupRestoreMode } from './backup-restore.mode.ts';

export interface BackupRestoreInput {
  readonly payload: AppBackupPayload;
  readonly currentState: AppBackupPayload;
  readonly mode: BackupRestoreMode;
  readonly checkpointRequested?: boolean;
}
