import type {
  BackupImportValidationResult,
  BackupImportValidationSuccess,
} from '@/domain/backup';
import { useGoogleAccountConnection } from '@/features/google/hooks/use-google-account-connection';
import type {
  GoogleDriveDownloadResult,
  GoogleDriveFailure,
  GoogleDriveListResult,
  GoogleDriveUploadResult,
} from '@/infrastructure/browser/google/drive-backup.adapter.ts';
import { createGoogleDriveBackupAdapter } from '@/infrastructure/browser/google/drive-backup.adapter.ts';
import { backupExportService } from '@/infrastructure/services';

import { useBackupImportValidation } from './use-backup-import-validation.ts';

export interface GoogleDriveBackupValidatedDownloadSuccess {
  readonly ok: true;
  readonly downloadResult: Extract<GoogleDriveDownloadResult, { ok: true }>;
  readonly validationResult: BackupImportValidationSuccess;
}

export interface GoogleDriveBackupValidatedDownloadFailure {
  readonly ok: false;
  readonly code: GoogleDriveFailure['code'] | 'VALIDATION_FAILED';
  readonly downloadResult: GoogleDriveDownloadResult | null;
  readonly message: string;
  readonly validationResult: BackupImportValidationResult | null;
}

export type GoogleDriveBackupValidatedDownloadResult =
  | GoogleDriveBackupValidatedDownloadSuccess
  | GoogleDriveBackupValidatedDownloadFailure;

export interface GoogleDriveBackupActions {
  downloadAndValidate(
    file: Extract<GoogleDriveListResult, { ok: true }>['files'][number]
  ): Promise<GoogleDriveBackupValidatedDownloadResult>;
  list(): Promise<GoogleDriveListResult>;
  upload(): Promise<GoogleDriveUploadResult>;
}

const googleDriveBackupAdapter = createGoogleDriveBackupAdapter();

export function useGoogleDriveBackup(): GoogleDriveBackupActions {
  const googleAccount = useGoogleAccountConnection();
  const importValidation = useBackupImportValidation();

  return {
    async upload(): Promise<GoogleDriveUploadResult> {
      const access = googleAccount.ensureAccess(googleAccount.requiredScopes);

      if (!access.ok) {
        return {
          ok: false,
          code:
            access.code === 'OFFLINE'
              ? 'NETWORK_ERROR'
              : access.code === 'AUTH_REQUIRED' ||
                  access.code === 'TOKEN_EXPIRED'
                ? 'GOOGLE_UNAUTHORIZED'
                : 'GOOGLE_FORBIDDEN',
          message: access.message,
          details: access.code,
        };
      }

      const exportResult = await backupExportService.execute();

      if (!exportResult.ok) {
        return {
          ok: false,
          code: 'GOOGLE_BAD_RESPONSE',
          message: 'Backup export preparation failed',
          details: exportResult.code,
        };
      }

      const uploadResult = await googleDriveBackupAdapter.uploadBackup({
        accessToken: access.accessToken,
        exportOutput: exportResult,
        folder: googleAccount.folder,
        storageMode: googleAccount.storageMode,
      });

      if (uploadResult.ok) {
        await googleAccount.setFolder(uploadResult.folder);
        await googleAccount.setRecentFiles([
          uploadResult.file,
          ...googleAccount.recentFiles.filter(
            (file) => file.id !== uploadResult.file.id
          ),
        ]);
      }

      return uploadResult;
    },

    async list(): Promise<GoogleDriveListResult> {
      const access = googleAccount.ensureAccess(googleAccount.requiredScopes);

      if (!access.ok) {
        return {
          ok: false,
          code:
            access.code === 'OFFLINE' ? 'NETWORK_ERROR' : 'GOOGLE_UNAUTHORIZED',
          message: access.message,
          details: access.code,
        };
      }

      const listResult = await googleDriveBackupAdapter.listBackups({
        accessToken: access.accessToken,
        folder: googleAccount.folder,
        storageMode: googleAccount.storageMode,
      });

      if (listResult.ok) {
        await googleAccount.setFolder(listResult.folder);
        await googleAccount.setRecentFiles(listResult.files);
      }

      return listResult;
    },

    async downloadAndValidate(
      file: Extract<GoogleDriveListResult, { ok: true }>['files'][number]
    ): Promise<GoogleDriveBackupValidatedDownloadResult> {
      const access = googleAccount.ensureAccess(googleAccount.requiredScopes);

      if (!access.ok) {
        return {
          ok: false,
          code:
            access.code === 'OFFLINE' ? 'NETWORK_ERROR' : 'GOOGLE_UNAUTHORIZED',
          message: access.message,
          downloadResult: null,
          validationResult: null,
        };
      }

      const downloadResult = await googleDriveBackupAdapter.downloadBackup({
        accessToken: access.accessToken,
        file,
      });

      if (!downloadResult.ok) {
        return {
          ok: false,
          code: downloadResult.code,
          message: downloadResult.message,
          downloadResult,
          validationResult: null,
        };
      }

      const validationResult = await importValidation.validateFromText(
        downloadResult.text,
        downloadResult.file.name
      );

      if (!validationResult.ok || !validationResult.validationResult.ok) {
        return {
          ok: false,
          code: 'VALIDATION_FAILED',
          message: validationResult.ok
            ? validationResult.validationResult.report.summary
            : validationResult.fileResult.message,
          downloadResult,
          validationResult: validationResult.ok
            ? validationResult.validationResult
            : null,
        };
      }

      return {
        ok: true,
        downloadResult,
        validationResult: validationResult.validationResult,
      };
    },
  };
}
