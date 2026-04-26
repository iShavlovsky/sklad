import type { AppBackupPayload } from '../app-backup.payload.ts';

export interface BackupExportInput extends Omit<
  AppBackupPayload,
  'exportedAt' | 'version'
> {
  readonly exportedAt: string;
}
