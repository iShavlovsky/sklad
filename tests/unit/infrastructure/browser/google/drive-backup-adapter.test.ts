// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { BackupExportOutput } from '../../../../../src/domain/backup';
import {
  createGoogleDriveBackupAdapter,
  googleDriveRequestBuilders,
} from '../../../../../src/infrastructure/browser/google/drive-backup.adapter';

function createExportOutput(): BackupExportOutput {
  return {
    payload: {
      arrivals: [],
      backupCheckpoints: [],
      backupHistory: [],
      categories: [],
      departures: [],
      drafts: [],
      exportedAt: '2026-04-28T00:00:00.000Z',
      favorites: [],
      products: [],
      profiles: [],
      recordCodes: [],
      settings: [],
      suppliers: [],
      version: 1,
    },
    report: {
      action: 'export',
      counts: {
        arrivals: 0,
        backupCheckpoints: 0,
        backupHistory: 0,
        categories: 0,
        departures: 0,
        drafts: 0,
        favorites: 0,
        products: 0,
        profiles: 0,
        recordCodes: 0,
        settings: 0,
        suppliers: 0,
      },
      details: null,
      exportedAt: '2026-04-28T00:00:00.000Z',
      status: 'success',
      summary: 'ok',
      version: 1,
    },
    historyRecord: {
      action: 'export',
      createdAt: '2026-04-28T00:00:00.000Z',
      details: null,
      id: 'history-1',
      status: 'success',
      summary: 'ok',
    },
  };
}

describe('Google Drive backup adapter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('builds appDataFolder list requests', () => {
    const url = googleDriveRequestBuilders.createListFilesUrl({
      folderId: null,
      storageMode: 'appDataFolder',
    });

    expect(url).toContain('spaces=appDataFolder');
    expect(url).toContain('mimeType');
  });

  it('uploads backup into appDataFolder with multipart body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'file-1',
          mimeType: 'application/json',
          modifiedTime: '2026-04-28T00:00:00.000Z',
          name: 'sklad-backup-v1-2026-04-28T00-00-00-000Z.json',
          size: '10',
        }),
        { status: 200 }
      )
    );

    const result = await createGoogleDriveBackupAdapter().uploadBackup({
      accessToken: 'token',
      exportOutput: createExportOutput(),
      storageMode: 'appDataFolder',
    });

    expect(result).toMatchObject({
      ok: true,
      file: {
        id: 'file-1',
        storageMode: 'appDataFolder',
      },
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/upload/drive/v3/files?uploadType=multipart'),
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
  });

  it('finds or creates the visible folder before listing files', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            files: [{ id: 'folder-1', name: 'SKLAD Backups' }],
          }),
          {
            status: 200,
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ files: [{ id: 'file-1', name: 'backup.json' }] }),
          {
            status: 200,
          }
        )
      );

    const result = await createGoogleDriveBackupAdapter().listBackups({
      accessToken: 'token',
      storageMode: 'visibleFolder',
    });

    expect(result).toMatchObject({
      ok: true,
      folder: { id: 'folder-1', name: 'SKLAD Backups' },
      files: [
        { id: 'file-1', name: 'backup.json', storageMode: 'visibleFolder' },
      ],
    });
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('SKLAD+Backups'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it.each([
    [401, 'GOOGLE_UNAUTHORIZED'],
    [403, 'GOOGLE_FORBIDDEN'],
    [404, 'FILE_NOT_FOUND'],
    [429, 'GOOGLE_RATE_LIMITED'],
    [500, 'GOOGLE_BAD_RESPONSE'],
  ])('maps Google status %s to %s', async (status, code) => {
    vi.mocked(fetch).mockResolvedValue(new Response('', { status }));

    const result = await createGoogleDriveBackupAdapter().listBackups({
      accessToken: 'token',
      storageMode: 'appDataFolder',
    });

    expect(result).toMatchObject({ ok: false, code });
  });

  it('downloads and parses Drive JSON without backup validation', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ version: 1 }), { status: 200 })
    );

    const result = await createGoogleDriveBackupAdapter().downloadBackup({
      accessToken: 'token',
      file: {
        id: 'file-1',
        mimeType: 'application/json',
        modifiedTime: null,
        name: 'backup.json',
        size: null,
        storageMode: 'appDataFolder',
      },
    });

    expect(result).toMatchObject({
      ok: true,
      text: '{"version":1}',
    });
  });

  it('rejects non-json Drive content before backup validation', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('not-json', { status: 200 })
    );

    const result = await createGoogleDriveBackupAdapter().downloadBackup({
      accessToken: 'token',
      file: {
        id: 'file-1',
        mimeType: 'text/plain',
        modifiedTime: null,
        name: 'backup.txt',
        size: null,
        storageMode: 'appDataFolder',
      },
    });

    expect(result).toMatchObject({ ok: false, code: 'INVALID_JSON' });
  });
});
