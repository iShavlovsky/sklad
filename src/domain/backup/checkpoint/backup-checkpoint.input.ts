import type { AppBackupPayload } from '../app-backup.payload.ts';

export interface BackupCheckpointInput {
  readonly label: string;
  readonly snapshot: AppBackupPayload;
  readonly createdAt?: string;
}
