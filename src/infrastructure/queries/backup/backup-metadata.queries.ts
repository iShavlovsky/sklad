import type {
  BackupCheckpointDetailsQuery,
  BackupCheckpointRecord,
  BackupHistoryDetailsQuery,
  BackupHistoryRecord,
} from '@/domain/backup';
import type { BackupCheckpointRepository } from '@/infrastructure/repositories/backup/backup-checkpoint.repository.ts';
import type { BackupHistoryRepository } from '@/infrastructure/repositories/backup/backup-history.repository.ts';

export class BackupMetadataQueries {
  private readonly checkpointRepository: BackupCheckpointRepository;
  private readonly historyRepository: BackupHistoryRepository;

  public constructor(
    checkpointRepository: BackupCheckpointRepository,
    historyRepository: BackupHistoryRepository
  ) {
    this.checkpointRepository = checkpointRepository;
    this.historyRepository = historyRepository;
  }

  public listCheckpoints(): Promise<BackupCheckpointRecord[]> {
    return this.checkpointRepository.list();
  }

  public async detailsCheckpoint(
    query: BackupCheckpointDetailsQuery
  ): Promise<BackupCheckpointRecord | null> {
    return (await this.checkpointRepository.getById(query.id)) ?? null;
  }

  public listHistory(): Promise<BackupHistoryRecord[]> {
    return this.historyRepository.list();
  }

  public async detailsHistory(
    query: BackupHistoryDetailsQuery
  ): Promise<BackupHistoryRecord | null> {
    return (await this.historyRepository.getById(query.id)) ?? null;
  }
}
