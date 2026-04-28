import { createContext, useContext } from 'react';

import type {
  GoogleAccessResult,
  GoogleAccountMetadata,
  GoogleDriveBackupFileMetadata,
  GoogleDriveFolderMetadata,
  GoogleDriveStorageMode,
} from '../model/google-account.types';

export type GoogleConnectPurpose = 'base' | 'visibleFolder';

export interface GoogleAccountConnection {
  readonly account: GoogleAccountMetadata | null;
  readonly configured: boolean;
  readonly connect: (
    purpose?: GoogleConnectPurpose
  ) => Promise<GoogleAccessResult>;
  readonly disconnect: () => Promise<void>;
  readonly ensureAccess: (
    requiredScopes: readonly string[]
  ) => GoogleAccessResult;
  readonly folder: GoogleDriveFolderMetadata | null;
  readonly isOnline: boolean;
  readonly recentFiles: GoogleDriveBackupFileMetadata[];
  readonly requiredScopes: readonly string[];
  readonly setFolder: (
    folder: GoogleDriveFolderMetadata | null
  ) => Promise<void>;
  readonly setRecentFiles: (
    files: GoogleDriveBackupFileMetadata[]
  ) => Promise<void>;
  readonly setStorageMode: (
    storageMode: GoogleDriveStorageMode
  ) => Promise<GoogleAccessResult>;
  readonly storageMode: GoogleDriveStorageMode;
  readonly tokenAccess: GoogleAccessResult;
}

export const GoogleAccountConnectionContext =
  createContext<GoogleAccountConnection | null>(null);

export function useGoogleAccountConnection(): GoogleAccountConnection {
  const connection = useContext(GoogleAccountConnectionContext);

  if (!connection) {
    throw new Error(
      'useGoogleAccountConnection must be used inside GoogleAccountConnectionProvider.'
    );
  }

  return connection;
}
