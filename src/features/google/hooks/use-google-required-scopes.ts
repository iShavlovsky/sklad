import { useEffect } from 'react';
import { useSet } from '@mantine/hooks';

import type { GoogleDriveStorageMode } from '../model/google-account.types';
import { getGoogleRequiredScopes } from '../model/google-account-access';

export function useGoogleRequiredScopes(
  storageMode: GoogleDriveStorageMode
): readonly string[] {
  const requiredScopes = useSet<string>([
    ...getGoogleRequiredScopes(storageMode),
  ]);

  useEffect(() => {
    requiredScopes.clear();
    getGoogleRequiredScopes(storageMode).forEach((scope) => {
      requiredScopes.add(scope);
    });
  }, [requiredScopes, storageMode]);

  return Array.from(requiredScopes);
}
