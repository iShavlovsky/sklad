import type { BackupImportValidationResult } from '@/domain/backup';
import {
  type BackupBrowserFileImportFailure,
  type BackupBrowserFileImportResult,
  type BackupBrowserFileImportSuccess,
  createBackupBrowserFileAdapter,
} from '@/infrastructure/browser/file/adapter.ts';
import { backupImportValidationService } from '@/infrastructure/services';

/**
 * Successful import validation flow returned by the backup import hook.
 */
export interface BackupImportValidationFlowSuccess {
  readonly ok: true;
  readonly fileResult: BackupBrowserFileImportSuccess;
  readonly validationResult: BackupImportValidationResult;
}

/**
 * Failed import validation flow returned by the backup import hook.
 */
export interface BackupImportValidationFlowFailure {
  readonly ok: false;
  readonly fileResult: BackupBrowserFileImportFailure;
}

/**
 * Validation flow result union exposed to backup import UI.
 */
export type BackupImportValidationFlowResult =
  | BackupImportValidationFlowSuccess
  | BackupImportValidationFlowFailure;

/**
 * UI-facing actions for reading and validating backup import candidates.
 */
export interface BackupImportValidationActions {
  validate(input: unknown): Promise<BackupImportValidationResult>;
  validateFromFile(file: File): Promise<BackupImportValidationFlowResult>;
  validateFromText(
    text: string,
    sourceName?: string | null
  ): Promise<BackupImportValidationFlowResult>;
  readFromFile(file: File): Promise<BackupBrowserFileImportResult>;
}

const backupBrowserFileAdapter = createBackupBrowserFileAdapter();

const backupImportValidationActions: BackupImportValidationActions = {
  validate(input: unknown): Promise<BackupImportValidationResult> {
    return backupImportValidationService.execute(input);
  },

  async validateFromFile(
    file: File
  ): Promise<BackupImportValidationFlowResult> {
    const fileResult =
      await backupBrowserFileAdapter.readImportCandidateFromFile(file);

    if (!fileResult.ok) {
      return {
        ok: false,
        fileResult,
      };
    }

    return {
      ok: true,
      fileResult,
      validationResult: await backupImportValidationService.execute(
        fileResult.candidate
      ),
    };
  },

  async validateFromText(
    text: string,
    sourceName: string | null = null
  ): Promise<BackupImportValidationFlowResult> {
    const fileResult = backupBrowserFileAdapter.readImportCandidateFromText(
      text,
      sourceName
    );

    if (!fileResult.ok) {
      return {
        ok: false,
        fileResult,
      };
    }

    return {
      ok: true,
      fileResult,
      validationResult: await backupImportValidationService.execute(
        fileResult.candidate
      ),
    };
  },

  readFromFile(file: File): Promise<BackupBrowserFileImportResult> {
    return backupBrowserFileAdapter.readImportCandidateFromFile(file);
  },
};

/**
 * Hook that exposes backup import validation through the reusable browser file
 * adapter and backup-specific validation service.
 */
export function useBackupImportValidation(): BackupImportValidationActions {
  return backupImportValidationActions;
}
