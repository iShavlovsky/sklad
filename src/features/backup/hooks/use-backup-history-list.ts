import { useLiveQuery } from 'dexie-react-hooks';

import type { BackupHistoryRecord } from '@/domain/backup';
import { appDb } from '@/infrastructure/db';
import { BackupMetadataQueries } from '@/infrastructure/queries/backup/backup-metadata.queries.ts';
import { BackupCheckpointRepository } from '@/infrastructure/repositories/backup/backup-checkpoint.repository.ts';
import { BackupHistoryRepository } from '@/infrastructure/repositories/backup/backup-history.repository.ts';

const backupCheckpointRepository = new BackupCheckpointRepository(
  appDb.backupCheckpoints
);
const backupHistoryRepository = new BackupHistoryRepository(
  appDb.backupHistory
);
const backupMetadataQueries = new BackupMetadataQueries(
  backupCheckpointRepository,
  backupHistoryRepository
);

/**
 * Live query hook for backup restore/export history reads.
 */
export function useBackupHistoryList(): BackupHistoryRecord[] {
  return useLiveQuery(() => backupMetadataQueries.listHistory(), []) ?? [];
}
