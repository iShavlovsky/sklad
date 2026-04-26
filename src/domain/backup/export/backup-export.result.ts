import type { AppBackupPayload } from '../app-backup.payload.ts';
import type { BackupHistoryRecord } from '../history/backup-history.record.ts';

import type { BackupExportReport } from './backup-export.report.ts';

/**
 * Canonical output of the backup export workflow.
 *
 * The browser file adapter consumes this shape to serialize and download the
 * exported payload without owning backup business semantics.
 */
export interface BackupExportOutput {
  readonly payload: AppBackupPayload;
  readonly report: BackupExportReport;
  readonly historyRecord: BackupHistoryRecord;
}
