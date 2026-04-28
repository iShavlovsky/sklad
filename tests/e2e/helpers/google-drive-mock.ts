import type { Page, Route } from '@playwright/test';

declare global {
  interface Window {
    __SKLAD_GOOGLE_CLIENT_ID__?: string;
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            callback: (response: unknown) => void;
            error_callback?: () => void;
            scope?: string;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

const MINIMAL_BACKUP_PAYLOAD = {
  exportedAt: '2026-01-01T00:00:00.000Z',
  version: 1,
  suppliers: [],
  categories: [],
  products: [],
  arrivals: [],
  departures: [],
  drafts: [],
  recordCodes: [],
  settings: [],
  favorites: [],
  profiles: [],
  backupCheckpoints: [],
  backupHistory: [],
};

export type GoogleDriveMockOptions = {
  expiresIn?: number;
  invalidDownloadJson?: boolean;
  scopes?: string;
};

export type GoogleDriveMockState = {
  uploadPayloads: string[];
};

async function fulfillJson(route: Route, body: unknown): Promise<void> {
  await route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export async function installGoogleDriveMock(
  page: Page,
  options: GoogleDriveMockOptions = {}
): Promise<GoogleDriveMockState> {
  const state: GoogleDriveMockState = {
    uploadPayloads: [],
  };
  const scopes =
    options.scopes ??
    'openid email profile https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';

  await page.addInitScript(
    ({ expiresIn, scopes: grantedScopes }) => {
      window.__SKLAD_GOOGLE_CLIENT_ID__ = 'playwright-google-client-id';
      window.google = {
        accounts: {
          oauth2: {
            initTokenClient(config: {
              callback: (response: unknown) => void;
              error_callback?: () => void;
              scope?: string;
            }) {
              return {
                requestAccessToken() {
                  config.callback({
                    access_token: 'mock-google-token',
                    expires_in: expiresIn,
                    scope: grantedScopes || config.scope,
                    token_type: 'Bearer',
                  });
                },
              };
            },
          },
        },
      };
    },
    {
      expiresIn: options.expiresIn ?? 3600,
      scopes,
    }
  );

  await page.route('https://accounts.google.com/gsi/client', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: 'window.google = window.google || { accounts: { oauth2: { initTokenClient: function(config){ return { requestAccessToken: function(){ config.callback({ access_token: "mock-google-token", expires_in: 3600, scope: config.scope, token_type: "Bearer" }); } }; } } } };',
    });
  });

  await page.route('https://www.googleapis.com/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === '/oauth2/v3/userinfo') {
      await fulfillJson(route, {
        email: 'owner@example.com',
        name: 'Owner Google',
        picture: 'https://example.com/avatar.png',
        sub: 'google-user-id',
      });
      return;
    }

    if (url.pathname === '/drive/v3/files' && request.method() === 'GET') {
      const query = url.searchParams.get('q') ?? '';

      if (query.includes('application/vnd.google-apps.folder')) {
        await fulfillJson(route, {
          files: [{ id: 'folder-1', name: 'SKLAD Backups' }],
        });
        return;
      }

      await fulfillJson(route, {
        files: [
          {
            id: 'drive-file-1',
            mimeType: 'application/json',
            modifiedTime: '2026-04-28T00:00:00.000Z',
            name: 'sklad-backup-v1-mock.json',
            size: '123',
          },
        ],
      });
      return;
    }

    if (url.pathname === '/drive/v3/files' && request.method() === 'POST') {
      await fulfillJson(route, { id: 'folder-1', name: 'SKLAD Backups' });
      return;
    }

    if (
      url.pathname === '/upload/drive/v3/files' &&
      request.method() === 'POST'
    ) {
      state.uploadPayloads.push(request.postData() ?? '');
      await fulfillJson(route, {
        id: 'drive-upload-1',
        mimeType: 'application/json',
        modifiedTime: '2026-04-28T00:00:00.000Z',
        name: 'sklad-backup-v1-uploaded.json',
        size: '456',
      });
      return;
    }

    if (
      url.pathname === '/drive/v3/files/drive-file-1' &&
      request.method() === 'GET'
    ) {
      await route.fulfill({
        contentType: 'application/json',
        body: options.invalidDownloadJson
          ? '{not-json'
          : JSON.stringify(MINIMAL_BACKUP_PAYLOAD),
      });
      return;
    }

    await route.fulfill({ status: 404, body: 'not mocked' });
  });

  return state;
}
