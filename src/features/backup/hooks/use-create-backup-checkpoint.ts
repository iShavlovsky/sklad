import { backupCheckpointService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the backup checkpoint creation facade.
 */
export function useCreateBackupCheckpoint(): typeof backupCheckpointService {
  return backupCheckpointService;
}
