import { useCallback, useRef } from 'react';
import { type TokenResponse, useGoogleLogin } from '@react-oauth/google';

import {
  type GoogleAccessResult,
  type GoogleAccountMetadata,
  type GoogleUserInfoResponse,
} from '../model/google-account.types';
import {
  createGoogleAccessFailure,
  createGoogleLoginScopes,
} from '../model/google-account-access';
import {
  clearGoogleTokenState,
  createGoogleTokenState,
  setGoogleTokenState,
} from '../model/google-token-state';

import type { GoogleConnectPurpose } from './use-google-account-connection';

interface UseGoogleLoginFlowInput {
  readonly isOnline: boolean;
  readonly saveAccount: (account: GoogleAccountMetadata) => Promise<void>;
}

async function loadGoogleUserInfo(
  accessToken: string
): Promise<GoogleAccountMetadata | null> {
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) return null;

  const data = (await response.json()) as GoogleUserInfoResponse;

  if (!data.email || !data.name || !data.sub) return null;

  const now = new Date().toISOString();

  return {
    connectedAt: now,
    email: data.email,
    lastValidatedAt: now,
    name: data.name,
    picture: data.picture ?? null,
    sub: data.sub,
  };
}

export function useGoogleLoginFlow({
  isOnline,
  saveAccount,
}: UseGoogleLoginFlowInput): (
  purpose?: GoogleConnectPurpose
) => Promise<GoogleAccessResult> {
  const loginResolver = useRef<((result: GoogleAccessResult) => void) | null>(
    null
  );

  const saveAccountFromToken = useCallback(
    async (tokenResponse: TokenResponse): Promise<GoogleAccessResult> => {
      setGoogleTokenState(
        createGoogleTokenState({
          accessToken: tokenResponse.access_token,
          expiresIn: tokenResponse.expires_in,
          scope: tokenResponse.scope,
        })
      );

      const metadata = await loadGoogleUserInfo(tokenResponse.access_token);

      if (!metadata) {
        clearGoogleTokenState();

        return createGoogleAccessFailure(
          'AUTH_REQUIRED',
          'Google не вернул данные аккаунта.'
        );
      }

      await saveAccount(metadata);

      return {
        ok: true,
        accessToken: tokenResponse.access_token,
      };
    },
    [saveAccount]
  );

  const handleLoginSuccess = useCallback(
    (tokenResponse: TokenResponse): void => {
      const resolve = loginResolver.current;
      loginResolver.current = null;
      void saveAccountFromToken(tokenResponse).then((result) => {
        resolve?.(result);
        return undefined;
      });
    },
    [saveAccountFromToken]
  );

  const handleLoginError = useCallback((): void => {
    const resolve = loginResolver.current;
    loginResolver.current = null;
    resolve?.(
      createGoogleAccessFailure(
        'AUTH_REQUIRED',
        'Google не подтвердил подключение.'
      )
    );
  }, []);

  const handleNonOAuthError = useCallback((): void => {
    const resolve = loginResolver.current;
    loginResolver.current = null;
    resolve?.(
      createGoogleAccessFailure(
        'AUTH_REQUIRED',
        'Окно Google было закрыто или заблокировано.'
      )
    );
  }, []);

  const connectBase = useGoogleLogin({
    flow: 'implicit',
    scope: createGoogleLoginScopes('base'),
    onSuccess: handleLoginSuccess,
    onError: handleLoginError,
    onNonOAuthError: handleNonOAuthError,
  });
  const connectVisibleFolder = useGoogleLogin({
    flow: 'implicit',
    scope: createGoogleLoginScopes('visibleFolder'),
    onSuccess: handleLoginSuccess,
    onError: handleLoginError,
    onNonOAuthError: handleNonOAuthError,
  });

  return useCallback(
    (purpose: GoogleConnectPurpose = 'base'): Promise<GoogleAccessResult> => {
      if (!isOnline) {
        return Promise.resolve(
          createGoogleAccessFailure(
            'OFFLINE',
            'Google Drive недоступен офлайн. Локальный backup работает.'
          )
        );
      }

      return new Promise((resolve) => {
        const login =
          purpose === 'visibleFolder' ? connectVisibleFolder : connectBase;

        loginResolver.current = resolve;
        login();
      });
    },
    [connectBase, connectVisibleFolder, isOnline]
  );
}
