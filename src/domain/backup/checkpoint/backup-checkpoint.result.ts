import type { BackupCheckpointRecord } from './backup-checkpoint.record.ts';
import type { BackupCheckpointReport } from './backup-checkpoint.report.ts';

export interface BackupCheckpointOutput {
  readonly checkpointRecord: BackupCheckpointRecord;
  readonly report: BackupCheckpointReport;
}
