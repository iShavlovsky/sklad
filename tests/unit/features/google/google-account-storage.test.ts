import { describe, expect, it } from 'vitest';

import {
  parseGoogleAccountMetadata,
  parseGoogleDriveRecentFiles,
  parseGoogleDriveStorageMode,
} from '../../../../src/features/google/model/google-account.storage';

describe('Google account persisted settings parsers', () => {
  it('parses safe account metadata without token fields', () => {
    const parsed = parseGoogleAccountMetadata({
      accessToken: 'must-not-survive',
      connectedAt: '2026-04-28T00:00:00.000Z',
      email: 'owner@example.com',
      lastValidatedAt: '2026-04-28T00:00:00.000Z',
      name: 'Owner',
      picture: 'https://example.com/avatar.png',
      sub: 'google-user-id',
    });

    expect(parsed).toEqual({
      connectedAt: '2026-04-28T00:00:00.000Z',
      email: 'owner@example.com',
      lastValidatedAt: '2026-04-28T00:00:00.000Z',
      name: 'Owner',
      picture: 'https://example.com/avatar.png',
      sub: 'google-user-id',
    });
    expect(parsed).not.toHaveProperty('accessToken');
  });

  it('defaults unknown storage modes to appDataFolder', () => {
    expect(parseGoogleDriveStorageMode('visibleFolder')).toBe('visibleFolder');
    expect(parseGoogleDriveStorageMode('bad')).toBe('appDataFolder');
  });

  it('keeps only valid recent Drive file metadata', () => {
    expect(
      parseGoogleDriveRecentFiles([
        {
          id: 'file-1',
          mimeType: 'application/json',
          modifiedTime: '2026-04-28T00:00:00.000Z',
          name: 'sklad-backup.json',
          size: '12',
          storageMode: 'visibleFolder',
        },
        { id: '', name: 'broken' },
      ])
    ).toEqual([
      {
        id: 'file-1',
        mimeType: 'application/json',
        modifiedTime: '2026-04-28T00:00:00.000Z',
        name: 'sklad-backup.json',
        size: '12',
        storageMode: 'visibleFolder',
      },
    ]);
  });
});
