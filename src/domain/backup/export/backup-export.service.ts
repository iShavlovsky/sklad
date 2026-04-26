import { createId } from '@/shared/utils/create-id.ts';

import type { AppBackupPayload } from '../app-backup.payload.ts';
import { APP_BACKUP_PAYLOAD_VERSION } from '../app-backup.payload.ts';
import type { BackupCheckpointRecord } from '../checkpoint/backup-checkpoint.record.ts';

import type { BackupExportInput } from './backup-export.input.ts';
import type { BackupExportCounts } from './backup-export.report.ts';
import type { BackupExportOutput } from './backup-export.result.ts';

function countRecords(input: BackupExportInput): BackupExportCounts {
  return {
    suppliers: input.suppliers.length,
    categories: input.categories.length,
    products: input.products.length,
    arrivals: input.arrivals.length,
    departures: input.departures.length,
    drafts: input.drafts.length,
    recordCodes: input.recordCodes.length,
    settings: input.settings.length,
    favorites: input.favorites.length,
    profiles: input.profiles.length,
    backupCheckpoints: input.backupCheckpoints.length,
    backupHistory: input.backupHistory.length,
  };
}

function sumCounts(counts: BackupExportCounts): number {
  return (
    counts.suppliers +
    counts.categories +
    counts.products +
    counts.arrivals +
    counts.departures +
    counts.drafts +
    counts.recordCodes +
    counts.settings +
    counts.favorites +
    counts.profiles +
    counts.backupCheckpoints +
    counts.backupHistory
  );
}

function normalizeCheckpointRecord(
  record: BackupCheckpointRecord
): BackupCheckpointRecord {
  return {
    ...record,
    snapshot: normalizeBackupPayload(record.snapshot),
  };
}

function normalizeBackupPayload(payload: AppBackupPayload): AppBackupPayload {
  return {
    ...payload,
    backupCheckpoints: payload.backupCheckpoints.map(normalizeCheckpointRecord),
  };
}

export class BackupExportService {
  public execute(input: BackupExportInput): BackupExportOutput {
    const payload = normalizeBackupPayload({
      version: APP_BACKUP_PAYLOAD_VERSION,
      exportedAt: input.exportedAt,
      suppliers: input.suppliers,
      categories: input.categories,
      products: input.products,
      arrivals: input.arrivals,
      departures: input.departures,
      drafts: input.drafts,
      recordCodes: input.recordCodes,
      settings: input.settings,
      favorites: input.favorites,
      profiles: input.profiles,
      backupCheckpoints: input.backupCheckpoints,
      backupHistory: input.backupHistory,
    });

    const counts = countRecords(input);
    const totalRecords = sumCounts(counts);
    const summary = `Exported ${totalRecords} records across 12 data groups`;
    const details = JSON.stringify({
      exportedAt: payload.exportedAt,
      version: payload.version,
      counts,
    });

    return {
      payload,
      report: {
        action: 'export',
        status: 'success',
        exportedAt: payload.exportedAt,
        version: payload.version,
        counts,
        summary,
        details,
      },
      historyRecord: {
        id: createId(),
        action: 'export',
        status: 'success',
        summary,
        details,
        createdAt: payload.exportedAt,
      },
    };
  }
}
