import {
  type BackupImportValidationResult,
  BackupImportValidationService,
} from '@/domain/backup';

export interface BackupImportValidationServiceFacade {
  execute(input: unknown): Promise<BackupImportValidationResult>;
}

export function createBackupImportValidationService(): BackupImportValidationServiceFacade {
  const backupImportValidationService = new BackupImportValidationService();

  return {
    async execute(input: unknown): Promise<BackupImportValidationResult> {
      return backupImportValidationService.execute(input);
    },
  };
}
