import type { BackupAction, BackupStatus } from '../../common/record-kinds.ts';

export interface BackupHistoryRecord {
  id: string;
  action: BackupAction;
  status: BackupStatus;
  summary: string;
  details: string | null;
  createdAt: string;
}
