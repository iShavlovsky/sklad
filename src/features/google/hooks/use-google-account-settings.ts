import { useCallback } from 'react';

import { useSaveSetting } from '@/features/settings/hooks/use-save-setting';
import { useSettingDetails } from '@/features/settings/hooks/use-setting-details';

import {
  parseGoogleAccountMetadata,
  parseGoogleDriveFolderMetadata,
  parseGoogleDriveRecentFiles,
  parseGoogleDriveStorageMode,
} from '../model/google-account.storage';
import {
  GOOGLE_ACCOUNT_SETTING_KEY,
  GOOGLE_DRIVE_FOLDER_SETTING_KEY,
  GOOGLE_DRIVE_RECENT_FILES_SETTING_KEY,
  GOOGLE_DRIVE_STORAGE_MODE_SETTING_KEY,
  type GoogleAccountMetadata,
  type GoogleDriveBackupFileMetadata,
  type GoogleDriveFolderMetadata,
  type GoogleDriveStorageMode,
} from '../model/google-account.types';

export interface GoogleAccountSettingsState {
  readonly account: GoogleAccountMetadata | null;
  readonly clearConnectionSettings: () => Promise<void>;
  readonly folder: GoogleDriveFolderMetadata | null;
  readonly recentFiles: GoogleDriveBackupFileMetadata[];
  readonly saveAccount: (account: GoogleAccountMetadata) => Promise<void>;
  readonly setFolder: (
    folder: GoogleDriveFolderMetadata | null
  ) => Promise<void>;
  readonly setRecentFiles: (
    files: GoogleDriveBackupFileMetadata[]
  ) => Promise<void>;
  readonly setStorageModeValue: (
    storageMode: GoogleDriveStorageMode
  ) => Promise<void>;
  readonly storageMode: GoogleDriveStorageMode;
}

export function useGoogleAccountSettings(): GoogleAccountSettingsState {
  const saveSetting = useSaveSetting();
  const accountSetting = useSettingDetails(GOOGLE_ACCOUNT_SETTING_KEY);
  const storageModeSetting = useSettingDetails(
    GOOGLE_DRIVE_STORAGE_MODE_SETTING_KEY
  );
  const folderSetting = useSettingDetails(GOOGLE_DRIVE_FOLDER_SETTING_KEY);
  const recentFilesSetting = useSettingDetails(
    GOOGLE_DRIVE_RECENT_FILES_SETTING_KEY
  );

  const saveAccount = useCallback(
    async (account: GoogleAccountMetadata): Promise<void> => {
      await saveSetting.execute({
        key: GOOGLE_ACCOUNT_SETTING_KEY,
        value: account,
      });
    },
    [saveSetting]
  );

  const setStorageModeValue = useCallback(
    async (storageMode: GoogleDriveStorageMode): Promise<void> => {
      await saveSetting.execute({
        key: GOOGLE_DRIVE_STORAGE_MODE_SETTING_KEY,
        value: storageMode,
      });
    },
    [saveSetting]
  );

  const setFolder = useCallback(
    async (folder: GoogleDriveFolderMetadata | null): Promise<void> => {
      await saveSetting.execute({
        key: GOOGLE_DRIVE_FOLDER_SETTING_KEY,
        value: folder,
      });
    },
    [saveSetting]
  );

  const setRecentFiles = useCallback(
    async (files: GoogleDriveBackupFileMetadata[]): Promise<void> => {
      await saveSetting.execute({
        key: GOOGLE_DRIVE_RECENT_FILES_SETTING_KEY,
        value: files.slice(0, 10),
      });
    },
    [saveSetting]
  );

  const clearConnectionSettings = useCallback(async (): Promise<void> => {
    await saveSetting.execute({ key: GOOGLE_ACCOUNT_SETTING_KEY, value: null });
    await saveSetting.execute({
      key: GOOGLE_DRIVE_FOLDER_SETTING_KEY,
      value: null,
    });
    await saveSetting.execute({
      key: GOOGLE_DRIVE_RECENT_FILES_SETTING_KEY,
      value: [],
    });
  }, [saveSetting]);

  return {
    account: parseGoogleAccountMetadata(accountSetting?.setting?.value),
    clearConnectionSettings,
    folder: parseGoogleDriveFolderMetadata(folderSetting?.setting?.value),
    recentFiles: parseGoogleDriveRecentFiles(
      recentFilesSetting?.setting?.value
    ),
    saveAccount,
    setFolder,
    setRecentFiles,
    setStorageModeValue,
    storageMode: parseGoogleDriveStorageMode(
      storageModeSetting?.setting?.value
    ),
  };
}
