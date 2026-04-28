import type { GoogleConnectPurpose } from '../hooks/use-google-account-connection';

import {
  GOOGLE_DRIVE_APPDATA_SCOPE,
  GOOGLE_DRIVE_FILE_SCOPE,
  GOOGLE_IDENTITY_SCOPES,
  type GoogleAccessFailure,
  type GoogleDriveStorageMode,
} from './google-account.types';

export function createGoogleAccessFailure(
  code: GoogleAccessFailure['code'],
  message: string
): GoogleAccessFailure {
  return {
    ok: false,
    code,
    message,
  };
}

export function createGoogleLoginScopes(purpose: GoogleConnectPurpose): string {
  const driveScopes =
    purpose === 'visibleFolder'
      ? `${GOOGLE_DRIVE_APPDATA_SCOPE} ${GOOGLE_DRIVE_FILE_SCOPE}`
      : GOOGLE_DRIVE_APPDATA_SCOPE;

  return `${GOOGLE_IDENTITY_SCOPES} ${driveScopes}`;
}

export function getGoogleRequiredScopes(
  storageMode: GoogleDriveStorageMode
): readonly string[] {
  return storageMode === 'visibleFolder'
    ? [GOOGLE_DRIVE_APPDATA_SCOPE, GOOGLE_DRIVE_FILE_SCOPE]
    : [GOOGLE_DRIVE_APPDATA_SCOPE];
}
