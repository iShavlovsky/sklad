import type { BackupRestoreConflict } from './backup-restore.conflict.ts';
import type { BackupRestoreMode } from './backup-restore.mode.ts';
import type { BackupRestoreCommitPlan } from './backup-restore.plan.ts';

export interface BackupRestoreReport {
  readonly action: 'restore-plan';
  readonly status: 'ready' | 'blocked';
  readonly readyToCommit: boolean;
  readonly mode: BackupRestoreMode;
  readonly payloadVersion: number | null;
  readonly historyWriteRequested: boolean;
  readonly checkpointWriteRequested: boolean;
  readonly conflicts: BackupRestoreConflict[];
  readonly plan: BackupRestoreCommitPlan | null;
  readonly summary: string;
  readonly details: string | null;
}
