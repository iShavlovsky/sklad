export const GOOGLE_ACCOUNT_SETTING_KEY = 'google.account';
export const GOOGLE_DRIVE_STORAGE_MODE_SETTING_KEY = 'google.drive.storageMode';
export const GOOGLE_DRIVE_FOLDER_SETTING_KEY = 'google.drive.folder';
export const GOOGLE_DRIVE_RECENT_FILES_SETTING_KEY = 'google.drive.recentFiles';

export const GOOGLE_DRIVE_APPDATA_SCOPE =
  'https://www.googleapis.com/auth/drive.appdata';
export const GOOGLE_DRIVE_FILE_SCOPE =
  'https://www.googleapis.com/auth/drive.file';
export const GOOGLE_IDENTITY_SCOPES = 'openid email profile';

export const GOOGLE_DRIVE_VISIBLE_FOLDER_NAME = 'SKLAD Backups';

export type GoogleDriveStorageMode = 'appDataFolder' | 'visibleFolder';

export interface GoogleAccountMetadata {
  readonly connectedAt: string;
  readonly email: string;
  readonly lastValidatedAt: string;
  readonly name: string;
  readonly picture: string | null;
  readonly sub: string;
}

export interface GoogleDriveFolderMetadata {
  readonly id: string;
  readonly name: string;
}

export interface GoogleDriveBackupFileMetadata {
  readonly id: string;
  readonly mimeType: string | null;
  readonly modifiedTime: string | null;
  readonly name: string;
  readonly size: string | null;
  readonly storageMode: GoogleDriveStorageMode;
}

export interface GoogleAccessTokenState {
  readonly accessToken: string;
  readonly expiresAt: number;
  readonly grantedScopes: readonly string[];
}

export type GoogleAccessFailureCode =
  | 'AUTH_REQUIRED'
  | 'CONFIG_MISSING'
  | 'OFFLINE'
  | 'SCOPE_MISSING'
  | 'TOKEN_EXPIRED';

export interface GoogleAccessSuccess {
  readonly ok: true;
  readonly accessToken: string;
}

export interface GoogleAccessFailure {
  readonly ok: false;
  readonly code: GoogleAccessFailureCode;
  readonly message: string;
}

export type GoogleAccessResult = GoogleAccessSuccess | GoogleAccessFailure;

export interface GoogleUserInfoResponse {
  readonly email?: string;
  readonly email_verified?: boolean;
  readonly name?: string;
  readonly picture?: string;
  readonly sub?: string;
}
