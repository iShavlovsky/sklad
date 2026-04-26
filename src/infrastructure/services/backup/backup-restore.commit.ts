import type { AppBackupPayload, BackupHistoryRecord } from '@/domain/backup';
import { createId } from '@/shared/utils/create-id.ts';

type BackupTableKey =
  | 'suppliers'
  | 'categories'
  | 'products'
  | 'arrivals'
  | 'departures'
  | 'drafts'
  | 'recordCodes'
  | 'settings'
  | 'favorites'
  | 'profiles'
  | 'backupCheckpoints'
  | 'backupHistory';

export function countBackupRecords(
  payload: AppBackupPayload
): Record<BackupTableKey, number> {
  return {
    suppliers: payload.suppliers.length,
    categories: payload.categories.length,
    products: payload.products.length,
    arrivals: payload.arrivals.length,
    departures: payload.departures.length,
    drafts: payload.drafts.length,
    recordCodes: payload.recordCodes.length,
    settings: payload.settings.length,
    favorites: payload.favorites.length,
    profiles: payload.profiles.length,
    backupCheckpoints: payload.backupCheckpoints.length,
    backupHistory: payload.backupHistory.length,
  };
}

export function createBackupRestoreHistoryRecord(
  planSummary: string,
  planDetails: string | null,
  committedAt: string,
  checkpointRequested: boolean,
  checkpointLabel: string | null,
  targetState: AppBackupPayload
): BackupHistoryRecord {
  return {
    id: createId(),
    action: 'restore',
    status: 'success',
    summary: planSummary,
    details: JSON.stringify({
      committedAt,
      checkpointRequested,
      checkpointLabel,
      targetCounts: countBackupRecords(targetState),
      planDetails,
    }),
    createdAt: committedAt,
  };
}

export async function clearAndPut<TRecord>(
  table: {
    clear(): Promise<void>;
    bulkPut(records: TRecord[]): Promise<unknown>;
  },
  records: TRecord[]
): Promise<void> {
  await table.clear();

  if (!records.length) {
    return;
  }

  await table.bulkPut(records);
}
