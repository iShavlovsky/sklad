import { backupRestoreService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the backup restore service facade.
 *
 * The returned handle plans and commits restore through the existing backup
 * planner and infrastructure service boundaries.
 */
export function useBackupRestore(): typeof backupRestoreService {
  return backupRestoreService;
}
