import {
  type BackupCheckpointInput,
  type BackupCheckpointOutput,
  BackupCheckpointService,
} from '@/domain/backup';
import { appDb } from '@/infrastructure/db';
import { BackupCheckpointRepository } from '@/infrastructure/repositories/backup/backup-checkpoint.repository.ts';

export interface BackupCheckpointServiceResult extends BackupCheckpointOutput {
  readonly ok: true;
}

export interface BackupCheckpointServiceFailure {
  readonly ok: false;
  readonly code: 'DB_WRITE_FAILED';
}

export type BackupCheckpointServiceFacadeResult =
  | BackupCheckpointServiceResult
  | BackupCheckpointServiceFailure;

export interface BackupCheckpointServiceFacade {
  execute(
    input: BackupCheckpointInput
  ): Promise<BackupCheckpointServiceFacadeResult>;
}

export function createBackupCheckpointService(): BackupCheckpointServiceFacade {
  const backupCheckpointRepository = new BackupCheckpointRepository(
    appDb.backupCheckpoints
  );
  const backupCheckpointService = new BackupCheckpointService();

  return {
    async execute(
      input: BackupCheckpointInput
    ): Promise<BackupCheckpointServiceFacadeResult> {
      try {
        return await appDb.transaction(
          'rw',
          [appDb.backupCheckpoints],
          async () => {
            const result = backupCheckpointService.execute(input);
            await backupCheckpointRepository.put(result.checkpointRecord);

            return {
              ok: true,
              ...result,
            };
          }
        );
      } catch {
        return {
          ok: false,
          code: 'DB_WRITE_FAILED',
        };
      }
    },
  };
}
