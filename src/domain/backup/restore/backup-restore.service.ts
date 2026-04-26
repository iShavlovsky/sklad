import type { BackupRestoreInput } from './backup-restore.input.ts';
import type { BackupRestoreResult } from './backup-restore.result.ts';

export interface BackupRestoreService {
  execute(input: BackupRestoreInput): Promise<BackupRestoreResult>;
}
