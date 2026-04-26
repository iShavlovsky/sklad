export interface BackupCheckpointReport {
  readonly action: 'checkpoint';
  readonly status: 'success';
  readonly label: string;
  readonly createdAt: string;
  readonly summary: string;
  readonly details: string | null;
}
