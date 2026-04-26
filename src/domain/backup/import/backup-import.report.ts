import type { ValidationIssue } from '@/domain/validation/validation-issue.ts';

export interface BackupImportCounts {
  readonly suppliers: number;
  readonly categories: number;
  readonly products: number;
  readonly arrivals: number;
  readonly departures: number;
  readonly drafts: number;
  readonly recordCodes: number;
  readonly settings: number;
  readonly favorites: number;
  readonly profiles: number;
  readonly backupCheckpoints: number;
  readonly backupHistory: number;
}

export interface BackupImportReport {
  readonly action: 'import-dry-run';
  readonly status: 'success' | 'error';
  readonly readyToCommit: boolean;
  readonly expectedVersion: number;
  readonly payloadVersion: number | null;
  readonly counts: BackupImportCounts | null;
  readonly issues: ValidationIssue[];
  readonly summary: string;
  readonly details: string | null;
}
