import type { AppBackupPayload } from '../app-backup.payload.ts';

export interface BackupCheckpointRecord {
  id: string;
  label: string;
  snapshot: AppBackupPayload;
  createdAt: string;
}
