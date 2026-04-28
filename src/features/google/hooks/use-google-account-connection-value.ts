import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useNetwork } from '@mantine/hooks';
import { googleLogout } from '@react-oauth/google';

import type {
  GoogleAccessResult,
  GoogleDriveBackupFileMetadata,
  GoogleDriveFolderMetadata,
  GoogleDriveStorageMode,
} from '../model/google-account.types';
import { GOOGLE_DRIVE_APPDATA_SCOPE } from '../model/google-account.types';
import {
  createGoogleAccessFailure,
  getGoogleRequiredScopes,
} from '../model/google-account-access';
import {
  clearGoogleTokenState,
  ensureGoogleAccessToken,
  getGoogleTokenState,
  subscribeGoogleTokenState,
} from '../model/google-token-state';

import {
  type GoogleAccountConnection,
  type GoogleConnectPurpose,
} from './use-google-account-connection';
import { useGoogleAccountSettings } from './use-google-account-settings';
import { useGoogleLoginFlow } from './use-google-login-flow';
import { useGoogleRequiredScopes } from './use-google-required-scopes';

export function useConfiguredGoogleAccountConnectionValue(): GoogleAccountConnection {
  const network = useNetwork();
  const settings = useGoogleAccountSettings();
  const token = useSyncExternalStore(
    subscribeGoogleTokenState,
    getGoogleTokenState,
    getGoogleTokenState
  );
  const requiredScopes = useGoogleRequiredScopes(settings.storageMode);
  const connect = useGoogleLoginFlow({
    isOnline: network.online,
    saveAccount: settings.saveAccount,
  });

  const ensureAccess = useCallback(
    (scopes: readonly string[]): GoogleAccessResult =>
      ensureGoogleAccessToken({
        configured: true,
        connected: settings.account !== null,
        online: network.online,
        requiredScopes: scopes,
        token,
      }),
    [network.online, settings.account, token]
  );

  const tokenAccess = ensureAccess(requiredScopes);

  const disconnect = useCallback(async (): Promise<void> => {
    const tokenState = getGoogleTokenState();

    if (tokenState?.accessToken) {
      googleLogout();
    }

    clearGoogleTokenState();
    await settings.clearConnectionSettings();
  }, [settings]);

  const setStorageMode = useCallback(
    async (
      nextStorageMode: GoogleDriveStorageMode
    ): Promise<GoogleAccessResult> => {
      const accessResult =
        nextStorageMode === 'visibleFolder'
          ? await connect('visibleFolder')
          : ensureAccess([GOOGLE_DRIVE_APPDATA_SCOPE]);

      if (!accessResult.ok) return accessResult;

      await settings.setStorageModeValue(nextStorageMode);

      return accessResult;
    },
    [connect, ensureAccess, settings]
  );

  return {
    account: settings.account,
    configured: true,
    connect,
    disconnect,
    ensureAccess,
    folder: settings.folder,
    isOnline: network.online,
    recentFiles: settings.recentFiles,
    requiredScopes,
    setFolder: settings.setFolder,
    setRecentFiles: settings.setRecentFiles,
    setStorageMode,
    storageMode: settings.storageMode,
    tokenAccess,
  };
}

export function useUnconfiguredGoogleAccountConnectionValue(): GoogleAccountConnection {
  const network = useNetwork();
  const settings = useGoogleAccountSettings();
  const requiredScopes = useMemo(
    () => getGoogleRequiredScopes(settings.storageMode),
    [settings.storageMode]
  );
  const configMissing = useMemo(
    () =>
      createGoogleAccessFailure(
        'CONFIG_MISSING',
        'Google Drive не настроен: отсутствует VITE_GOOGLE_CLIENT_ID.'
      ),
    []
  );

  const disconnect = useCallback(async (): Promise<void> => {
    clearGoogleTokenState();
    await settings.clearConnectionSettings();
  }, [settings]);

  const connect = useCallback(
    (_purpose: GoogleConnectPurpose = 'base') => Promise.resolve(configMissing),
    [configMissing]
  );

  const setStorageMode = useCallback(
    (_storageMode: GoogleDriveStorageMode) => Promise.resolve(configMissing),
    [configMissing]
  );

  const setFolder = useCallback(
    (folder: GoogleDriveFolderMetadata | null): Promise<void> =>
      settings.setFolder(folder),
    [settings]
  );

  const setRecentFiles = useCallback(
    (files: GoogleDriveBackupFileMetadata[]): Promise<void> =>
      settings.setRecentFiles(files),
    [settings]
  );

  return {
    account: settings.account,
    configured: false,
    connect,
    disconnect,
    ensureAccess: () => configMissing,
    folder: settings.folder,
    isOnline: network.online,
    recentFiles: settings.recentFiles,
    requiredScopes,
    setFolder,
    setRecentFiles,
    setStorageMode,
    storageMode: settings.storageMode,
    tokenAccess: configMissing,
  };
}
