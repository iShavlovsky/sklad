import type {
  GoogleAccountMetadata,
  GoogleDriveBackupFileMetadata,
  GoogleDriveFolderMetadata,
  GoogleDriveStorageMode,
} from './google-account.types';

export function isGoogleDriveStorageMode(
  value: unknown
): value is GoogleDriveStorageMode {
  return value === 'appDataFolder' || value === 'visibleFolder';
}

export function parseGoogleDriveStorageMode(
  value: unknown
): GoogleDriveStorageMode {
  return isGoogleDriveStorageMode(value) ? value : 'appDataFolder';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export function parseGoogleAccountMetadata(
  value: unknown
): GoogleAccountMetadata | null {
  if (!isRecord(value)) return null;

  const connectedAt = readString(value.connectedAt);
  const email = readString(value.email);
  const lastValidatedAt = readString(value.lastValidatedAt);
  const name = readString(value.name);
  const sub = readString(value.sub);

  if (!connectedAt || !email || !lastValidatedAt || !name || !sub) {
    return null;
  }

  return {
    connectedAt,
    email,
    lastValidatedAt,
    name,
    picture: readString(value.picture),
    sub,
  };
}

export function parseGoogleDriveFolderMetadata(
  value: unknown
): GoogleDriveFolderMetadata | null {
  if (!isRecord(value)) return null;

  const id = readString(value.id);
  const name = readString(value.name);

  return id && name ? { id, name } : null;
}

function parseRecentFile(value: unknown): GoogleDriveBackupFileMetadata | null {
  if (!isRecord(value)) return null;

  const id = readString(value.id);
  const mimeType = readString(value.mimeType);
  const modifiedTime = readString(value.modifiedTime);
  const name = readString(value.name);
  const size = readString(value.size);
  const storageMode = parseGoogleDriveStorageMode(value.storageMode);

  return id && name
    ? {
        id,
        mimeType,
        modifiedTime,
        name,
        size,
        storageMode,
      }
    : null;
}

export function parseGoogleDriveRecentFiles(
  value: unknown
): GoogleDriveBackupFileMetadata[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(parseRecentFile)
    .filter((file): file is GoogleDriveBackupFileMetadata => file !== null)
    .slice(0, 10);
}
