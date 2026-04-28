import type { BackupExportOutput } from '@/domain/backup';
import type {
  GoogleDriveBackupFileMetadata,
  GoogleDriveFolderMetadata,
  GoogleDriveStorageMode,
} from '@/features/google/model/google-account.types';
import { GOOGLE_DRIVE_VISIBLE_FOLDER_NAME } from '@/features/google/model/google-account.types';
import { createJsonEngine } from '@/infrastructure/serialization/json.engine.ts';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';
const BACKUP_JSON_MIME_TYPE = 'application/json';

export type GoogleDriveFailureCode =
  | 'FILE_NOT_FOUND'
  | 'GOOGLE_BAD_RESPONSE'
  | 'GOOGLE_FORBIDDEN'
  | 'GOOGLE_RATE_LIMITED'
  | 'GOOGLE_UNAUTHORIZED'
  | 'INVALID_JSON'
  | 'NETWORK_ERROR';

export interface GoogleDriveFailure {
  readonly ok: false;
  readonly code: GoogleDriveFailureCode;
  readonly details: string | null;
  readonly message: string;
}

export interface GoogleDriveUploadSuccess {
  readonly ok: true;
  readonly file: GoogleDriveBackupFileMetadata;
  readonly folder: GoogleDriveFolderMetadata | null;
}

export interface GoogleDriveListSuccess {
  readonly ok: true;
  readonly files: GoogleDriveBackupFileMetadata[];
  readonly folder: GoogleDriveFolderMetadata | null;
}

export interface GoogleDriveDownloadSuccess {
  readonly ok: true;
  readonly file: GoogleDriveBackupFileMetadata;
  readonly text: string;
}

export type GoogleDriveUploadResult =
  | GoogleDriveUploadSuccess
  | GoogleDriveFailure;
export type GoogleDriveListResult = GoogleDriveListSuccess | GoogleDriveFailure;
export type GoogleDriveDownloadResult =
  | GoogleDriveDownloadSuccess
  | GoogleDriveFailure;

export interface GoogleDriveBackupAdapter {
  downloadBackup(input: {
    accessToken: string;
    file: GoogleDriveBackupFileMetadata;
  }): Promise<GoogleDriveDownloadResult>;
  listBackups(input: {
    accessToken: string;
    folder?: GoogleDriveFolderMetadata | null;
    storageMode: GoogleDriveStorageMode;
  }): Promise<GoogleDriveListResult>;
  uploadBackup(input: {
    accessToken: string;
    exportOutput: BackupExportOutput;
    folder?: GoogleDriveFolderMetadata | null;
    storageMode: GoogleDriveStorageMode;
  }): Promise<GoogleDriveUploadResult>;
}

type GoogleDriveFileResponse = {
  id?: string;
  mimeType?: string;
  modifiedTime?: string;
  name?: string;
  size?: string;
};

type GoogleDriveFilesResponse = {
  files?: GoogleDriveFileResponse[];
};

function createBackupFileName(exportedAt: string, version: number): string {
  return `sklad-backup-v${version}-${exportedAt.replaceAll(/[:.]/g, '-')}.json`;
}

function escapeDriveQueryValue(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function createFailure(
  code: GoogleDriveFailureCode,
  message: string,
  details: string | null = null
): GoogleDriveFailure {
  return {
    ok: false,
    code,
    message,
    details,
  };
}

function mapStatusFailure(response: Response): GoogleDriveFailure {
  if (response.status === 401)
    return createFailure('GOOGLE_UNAUTHORIZED', 'Google access token rejected');
  if (response.status === 403)
    return createFailure('GOOGLE_FORBIDDEN', 'Google Drive access denied');
  if (response.status === 404)
    return createFailure('FILE_NOT_FOUND', 'Google Drive file was not found');
  if (response.status === 429)
    return createFailure('GOOGLE_RATE_LIMITED', 'Google Drive rate limit hit');

  return createFailure(
    'GOOGLE_BAD_RESPONSE',
    'Google Drive returned an unexpected response',
    `${response.status} ${response.statusText}`.trim()
  );
}

async function readJsonResponse<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function toBackupFile(
  file: GoogleDriveFileResponse,
  storageMode: GoogleDriveStorageMode
): GoogleDriveBackupFileMetadata | null {
  if (!file.id || !file.name) return null;

  return {
    id: file.id,
    mimeType: file.mimeType ?? null,
    modifiedTime: file.modifiedTime ?? null,
    name: file.name,
    size: file.size ?? null,
    storageMode,
  };
}

function createAuthHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function createListFilesUrl(input: {
  folderId: string | null;
  storageMode: GoogleDriveStorageMode;
}): string {
  const params = new URLSearchParams({
    fields: 'files(id,name,mimeType,modifiedTime,size)',
    orderBy: 'modifiedTime desc',
    pageSize: '10',
    q: "trashed=false and (mimeType='application/json' or name contains '.json')",
  });

  if (input.storageMode === 'appDataFolder') {
    params.set('spaces', 'appDataFolder');
  }

  if (input.storageMode === 'visibleFolder' && input.folderId) {
    params.set(
      'q',
      `${params.get('q')} and '${escapeDriveQueryValue(input.folderId)}' in parents`
    );
  }

  return `${DRIVE_API_BASE}/files?${params.toString()}`;
}

function createSearchFolderUrl(folderName: string): string {
  const params = new URLSearchParams({
    fields: 'files(id,name)',
    q: [
      "mimeType='application/vnd.google-apps.folder'",
      'trashed=false',
      `name='${escapeDriveQueryValue(folderName)}'`,
    ].join(' and '),
  });

  return `${DRIVE_API_BASE}/files?${params.toString()}`;
}

async function request(
  url: string,
  init: RequestInit
): Promise<Response | GoogleDriveFailure> {
  try {
    const response = await fetch(url, init);

    return response.ok ? response : mapStatusFailure(response);
  } catch (error) {
    return createFailure(
      'NETWORK_ERROR',
      'Google Drive request failed',
      error instanceof Error ? error.message : String(error)
    );
  }
}

class DefaultGoogleDriveBackupAdapter implements GoogleDriveBackupAdapter {
  private readonly jsonEngine = createJsonEngine();

  public async uploadBackup(input: {
    accessToken: string;
    exportOutput: BackupExportOutput;
    folder?: GoogleDriveFolderMetadata | null;
    storageMode: GoogleDriveStorageMode;
  }): Promise<GoogleDriveUploadResult> {
    const folderResult = await this.resolveFolder(input);

    if (!folderResult.ok) return folderResult;

    const fileName = createBackupFileName(
      input.exportOutput.report.exportedAt,
      input.exportOutput.report.version
    );
    const jsonText = this.jsonEngine.serialize(input.exportOutput.payload);
    const parents =
      input.storageMode === 'appDataFolder'
        ? ['appDataFolder']
        : folderResult.folder
          ? [folderResult.folder.id]
          : [];
    const metadata = {
      name: fileName,
      mimeType: BACKUP_JSON_MIME_TYPE,
      parents,
      appProperties: {
        app: 'sklad',
        backupVersion: String(input.exportOutput.report.version),
        storageMode: input.storageMode,
      },
    };
    const form = new FormData();

    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: BACKUP_JSON_MIME_TYPE })
    );
    form.append(
      'file',
      new Blob([jsonText], { type: BACKUP_JSON_MIME_TYPE }),
      fileName
    );

    const response = await request(
      `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size`,
      {
        method: 'POST',
        headers: createAuthHeaders(input.accessToken),
        body: form,
      }
    );

    if (!(response instanceof Response)) return response;

    const data = await readJsonResponse<GoogleDriveFileResponse>(response);
    const file = data ? toBackupFile(data, input.storageMode) : null;

    if (!file) {
      return createFailure(
        'GOOGLE_BAD_RESPONSE',
        'Google Drive upload response was incomplete'
      );
    }

    return {
      ok: true,
      file,
      folder: folderResult.folder,
    };
  }

  public async listBackups(input: {
    accessToken: string;
    folder?: GoogleDriveFolderMetadata | null;
    storageMode: GoogleDriveStorageMode;
  }): Promise<GoogleDriveListResult> {
    const folderResult = await this.resolveFolder(input);

    if (!folderResult.ok) return folderResult;

    const response = await request(
      createListFilesUrl({
        folderId: folderResult.folder?.id ?? null,
        storageMode: input.storageMode,
      }),
      {
        method: 'GET',
        headers: createAuthHeaders(input.accessToken),
      }
    );

    if (!(response instanceof Response)) return response;

    const data = await readJsonResponse<GoogleDriveFilesResponse>(response);
    const files = (data?.files ?? [])
      .map((file) => toBackupFile(file, input.storageMode))
      .filter((file): file is GoogleDriveBackupFileMetadata => file !== null);

    return {
      ok: true,
      files,
      folder: folderResult.folder,
    };
  }

  public async downloadBackup(input: {
    accessToken: string;
    file: GoogleDriveBackupFileMetadata;
  }): Promise<GoogleDriveDownloadResult> {
    const response = await request(
      `${DRIVE_API_BASE}/files/${encodeURIComponent(input.file.id)}?alt=media`,
      {
        method: 'GET',
        headers: createAuthHeaders(input.accessToken),
      }
    );

    if (!(response instanceof Response)) return response;

    try {
      const text = await response.text();

      JSON.parse(text);

      return {
        ok: true,
        file: input.file,
        text,
      };
    } catch (error) {
      return createFailure(
        'INVALID_JSON',
        'Google Drive file is not valid JSON',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private async resolveFolder(input: {
    accessToken: string;
    folder?: GoogleDriveFolderMetadata | null;
    storageMode: GoogleDriveStorageMode;
  }): Promise<
    { ok: true; folder: GoogleDriveFolderMetadata | null } | GoogleDriveFailure
  > {
    if (input.storageMode === 'appDataFolder') {
      return { ok: true, folder: null };
    }

    if (input.folder?.id && input.folder.name) {
      return { ok: true, folder: input.folder };
    }

    const found = await this.findVisibleFolder(input.accessToken);

    if (!found.ok || found.folder) return found;

    return this.createVisibleFolder(input.accessToken);
  }

  private async findVisibleFolder(
    accessToken: string
  ): Promise<
    { ok: true; folder: GoogleDriveFolderMetadata | null } | GoogleDriveFailure
  > {
    const response = await request(
      createSearchFolderUrl(GOOGLE_DRIVE_VISIBLE_FOLDER_NAME),
      {
        method: 'GET',
        headers: createAuthHeaders(accessToken),
      }
    );

    if (!(response instanceof Response)) return response;

    const data = await readJsonResponse<GoogleDriveFilesResponse>(response);
    const folder = data?.files?.[0];

    return {
      ok: true,
      folder:
        folder?.id && folder.name
          ? {
              id: folder.id,
              name: folder.name,
            }
          : null,
    };
  }

  private async createVisibleFolder(
    accessToken: string
  ): Promise<
    { ok: true; folder: GoogleDriveFolderMetadata } | GoogleDriveFailure
  > {
    const response = await request(`${DRIVE_API_BASE}/files?fields=id,name`, {
      method: 'POST',
      headers: {
        ...createAuthHeaders(accessToken),
        'Content-Type': BACKUP_JSON_MIME_TYPE,
      },
      body: JSON.stringify({
        name: GOOGLE_DRIVE_VISIBLE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!(response instanceof Response)) return response;

    const folder = await readJsonResponse<GoogleDriveFileResponse>(response);

    if (!folder?.id || !folder.name) {
      return createFailure(
        'GOOGLE_BAD_RESPONSE',
        'Google Drive folder response was incomplete'
      );
    }

    return {
      ok: true,
      folder: {
        id: folder.id,
        name: folder.name,
      },
    };
  }
}

export function createGoogleDriveBackupAdapter(): GoogleDriveBackupAdapter {
  return new DefaultGoogleDriveBackupAdapter();
}

export const googleDriveRequestBuilders = {
  createListFilesUrl,
  createSearchFolderUrl,
};
