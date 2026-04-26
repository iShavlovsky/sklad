import {
  type BackupBrowserFileExportFailure,
  type BackupBrowserFileExportSuccess,
  createBackupBrowserFileAdapter,
} from '@/infrastructure/browser/file/adapter.ts';
import { backupExportService } from '@/infrastructure/services';
import type {
  BackupExportServiceFacadeResult,
  BackupExportServiceFailure,
  BackupExportServiceResult,
} from '@/infrastructure/services/backup/backup-export.services.ts';

/**
 * Successful export-and-save result returned by the backup export hook.
 */
export interface BackupExportSaveToFileSuccess {
  readonly ok: true;
  readonly exportResult: BackupExportServiceResult;
  readonly fileResult: BackupBrowserFileExportSuccess;
}

/**
 * Failed export-and-save result returned by the backup export hook.
 */
export interface BackupExportSaveToFileFailure {
  readonly ok: false;
  readonly code:
    | BackupExportServiceFailure['code']
    | BackupBrowserFileExportFailure['code'];
  readonly message: string;
  readonly details: string | null;
  readonly exportResult: BackupExportServiceFacadeResult | null;
  readonly fileResult: BackupBrowserFileExportFailure | null;
}

/**
 * Save-to-file result union for the backup export hook.
 */
export type BackupExportSaveToFileResult =
  | BackupExportSaveToFileSuccess
  | BackupExportSaveToFileFailure;

/**
 * UI-facing backup export actions.
 *
 * Use `execute()` when only the canonical export payload/report is needed.
 * Use `saveToFile()` when the UI wants the browser adapter to download JSON.
 */
export interface BackupExportActions {
  execute(): Promise<BackupExportServiceFacadeResult>;
  saveToFile(fileName?: string | null): Promise<BackupExportSaveToFileResult>;
}

const backupBrowserFileAdapter = createBackupBrowserFileAdapter();

const backupExportActions: BackupExportActions = {
  execute(): Promise<BackupExportServiceFacadeResult> {
    return backupExportService.execute();
  },

  async saveToFile(
    fileName: string | null = null
  ): Promise<BackupExportSaveToFileResult> {
    const exportResult = await backupExportService.execute();

    if (!exportResult.ok) {
      return {
        ok: false,
        code: exportResult.code,
        message: 'Backup export preparation failed',
        details: null,
        exportResult,
        fileResult: null,
      };
    }

    const fileResult = await backupBrowserFileAdapter.saveExport({
      output: exportResult,
      fileName,
    });

    if (!fileResult.ok) {
      return {
        ok: false,
        code: fileResult.code,
        message: fileResult.message,
        details: fileResult.details,
        exportResult,
        fileResult,
      };
    }

    return {
      ok: true,
      exportResult,
      fileResult,
    };
  },
};

/**
 * Hook that exposes backup export actions over the existing service and browser
 * file adapter boundaries.
 */
export function useBackupExport(): BackupExportActions {
  return backupExportActions;
}
