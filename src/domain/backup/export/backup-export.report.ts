export interface BackupExportCounts {
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

export interface BackupExportReport {
  readonly action: 'export';
  readonly status: 'success';
  readonly exportedAt: string;
  readonly version: number;
  readonly counts: BackupExportCounts;
  readonly summary: string;
  readonly details: string | null;
}
