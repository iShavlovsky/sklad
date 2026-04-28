import { describe, expect, it } from 'vitest';

import {
  createGoogleTokenState,
  ensureGoogleAccessToken,
} from '../../../../src/features/google/model/google-token-state';

describe('Google token access checks', () => {
  const scope = 'https://www.googleapis.com/auth/drive.appdata';

  it('blocks missing Google configuration', () => {
    const result = ensureGoogleAccessToken({
      configured: false,
      connected: true,
      online: true,
      requiredScopes: [scope],
      token: createGoogleTokenState({
        accessToken: 'token',
        expiresIn: 3600,
        scope,
        now: 1_000,
      }),
      now: 1_000,
    });

    expect(result).toMatchObject({ ok: false, code: 'CONFIG_MISSING' });
  });

  it('blocks offline access', () => {
    const result = ensureGoogleAccessToken({
      configured: true,
      connected: true,
      online: false,
      requiredScopes: [scope],
      token: null,
    });

    expect(result).toMatchObject({ ok: false, code: 'OFFLINE' });
  });

  it('blocks disconnected or missing token state', () => {
    const result = ensureGoogleAccessToken({
      configured: true,
      connected: false,
      online: true,
      requiredScopes: [scope],
      token: null,
    });

    expect(result).toMatchObject({ ok: false, code: 'AUTH_REQUIRED' });
  });

  it('blocks token that is inside the expiry safety window', () => {
    const result = ensureGoogleAccessToken({
      configured: true,
      connected: true,
      online: true,
      requiredScopes: [scope],
      token: createGoogleTokenState({
        accessToken: 'token',
        expiresIn: 30,
        scope,
        now: 1_000,
      }),
      now: 1_000,
    });

    expect(result).toMatchObject({ ok: false, code: 'TOKEN_EXPIRED' });
  });

  it('blocks missing required scopes', () => {
    const result = ensureGoogleAccessToken({
      configured: true,
      connected: true,
      online: true,
      requiredScopes: [scope],
      token: createGoogleTokenState({
        accessToken: 'token',
        expiresIn: 3600,
        scope: 'openid email profile',
        now: 1_000,
      }),
      now: 1_000,
    });

    expect(result).toMatchObject({ ok: false, code: 'SCOPE_MISSING' });
  });

  it('accepts a connected account with valid unexpired scope', () => {
    const result = ensureGoogleAccessToken({
      configured: true,
      connected: true,
      online: true,
      requiredScopes: [scope],
      token: createGoogleTokenState({
        accessToken: 'token',
        expiresIn: 3600,
        scope,
        now: 1_000,
      }),
      now: 1_000,
    });

    expect(result).toEqual({ ok: true, accessToken: 'token' });
  });
});
