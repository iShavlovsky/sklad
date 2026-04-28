import type {
  GoogleAccessResult,
  GoogleAccessTokenState,
} from './google-account.types';

const TOKEN_EXPIRY_SAFETY_WINDOW_MS = 60_000;

let tokenState: GoogleAccessTokenState | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

export function getGoogleTokenState(): GoogleAccessTokenState | null {
  return tokenState;
}

export function setGoogleTokenState(
  nextTokenState: GoogleAccessTokenState
): void {
  tokenState = nextTokenState;
  notify();
}

export function clearGoogleTokenState(): void {
  tokenState = null;
  notify();
}

export function subscribeGoogleTokenState(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function toGoogleGrantedScopes(scope: string | undefined): string[] {
  return scope?.split(/\s+/).filter(Boolean) ?? [];
}

export function createGoogleTokenState(input: {
  accessToken: string;
  expiresIn: number;
  scope?: string;
  now?: number;
}): GoogleAccessTokenState {
  const now = input.now ?? Date.now();

  return {
    accessToken: input.accessToken,
    expiresAt: now + input.expiresIn * 1000,
    grantedScopes: toGoogleGrantedScopes(input.scope),
  };
}

export function ensureGoogleAccessToken(input: {
  configured: boolean;
  connected: boolean;
  now?: number;
  online: boolean;
  requiredScopes: readonly string[];
  token: GoogleAccessTokenState | null;
}): GoogleAccessResult {
  if (!input.configured) {
    return {
      ok: false,
      code: 'CONFIG_MISSING',
      message: 'Google Drive не настроен: отсутствует VITE_GOOGLE_CLIENT_ID.',
    };
  }

  if (!input.online) {
    return {
      ok: false,
      code: 'OFFLINE',
      message: 'Google Drive недоступен офлайн. Локальный backup работает.',
    };
  }

  if (!input.connected || input.token === null) {
    return {
      ok: false,
      code: 'AUTH_REQUIRED',
      message: 'Подключите Google аккаунт или обновите доступ.',
    };
  }

  const now = input.now ?? Date.now();

  if (input.token.expiresAt - TOKEN_EXPIRY_SAFETY_WINDOW_MS <= now) {
    return {
      ok: false,
      code: 'TOKEN_EXPIRED',
      message: 'Доступ к Google истек. Обновите подключение.',
    };
  }

  const hasRequiredScopes = input.requiredScopes.every((scope) =>
    input.token?.grantedScopes.includes(scope)
  );

  if (!hasRequiredScopes) {
    return {
      ok: false,
      code: 'SCOPE_MISSING',
      message: 'Для выбранного режима нужен дополнительный доступ к Drive.',
    };
  }

  return {
    ok: true,
    accessToken: input.token.accessToken,
  };
}
