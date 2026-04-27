import { describe, expect, it } from 'vitest';

import {
  APP_BACKUP_PAYLOAD_VERSION,
  type AppBackupPayload,
  BackupExportService,
  BackupImportValidationService,
  BackupRestorePlanner,
} from '../../../../src/domain/backup';
import type { SettingRecord } from '../../../../src/domain/settings/setting.record.ts';

function createPayload(
  overrides: Partial<AppBackupPayload> = {}
): AppBackupPayload {
  return {
    arrivals: [],
    backupCheckpoints: [],
    backupHistory: [],
    categories: [],
    departures: [],
    drafts: [],
    exportedAt: '2026-01-01T00:00:00.000Z',
    favorites: [],
    products: [],
    profiles: [],
    recordCodes: [],
    settings: [],
    suppliers: [],
    version: APP_BACKUP_PAYLOAD_VERSION,
    ...overrides,
  };
}

function createSetting(
  key: string,
  value: unknown,
  updatedAt = '2026-01-01T00:00:00.000Z'
): SettingRecord {
  return {
    key,
    updatedAt,
    value,
  };
}

describe('BackupImportValidationService', () => {
  it('rejects non-canonical payload shapes without a commit-ready report', () => {
    const service = new BackupImportValidationService();

    const result = service.execute({
      exportedAt: '2026-01-01T00:00:00.000Z',
      settings: [],
      version: APP_BACKUP_PAYLOAD_VERSION,
    });

    expect(result).toMatchObject({
      code: 'INVALID_PAYLOAD',
      ok: false,
      report: {
        readyToCommit: false,
        status: 'error',
      },
    });
  });

  it('accepts the canonical payload and reports table counts', () => {
    const service = new BackupImportValidationService();

    const result = service.execute(
      createPayload({
        settings: [createSetting('theme', 'dark')],
      })
    );

    expect(result).toMatchObject({
      ok: true,
      report: {
        counts: {
          settings: 1,
        },
        payloadVersion: APP_BACKUP_PAYLOAD_VERSION,
        readyToCommit: true,
        status: 'success',
      },
    });
  });
});

describe('BackupExportService', () => {
  it('exports canonical payload, report counts, and success history record', () => {
    const service = new BackupExportService();
    const exportedAt = '2026-02-01T00:00:00.000Z';

    const result = service.execute({
      ...createPayload({
        exportedAt,
        settings: [createSetting('theme', 'light')],
      }),
      exportedAt,
    });

    expect(result.payload).toMatchObject({
      exportedAt,
      settings: [expect.objectContaining({ key: 'theme' })],
      version: APP_BACKUP_PAYLOAD_VERSION,
    });
    expect(result.report).toMatchObject({
      action: 'export',
      counts: {
        settings: 1,
      },
      status: 'success',
      version: APP_BACKUP_PAYLOAD_VERSION,
    });
    expect(result.historyRecord).toMatchObject({
      action: 'export',
      createdAt: exportedAt,
      status: 'success',
    });
  });
});

describe('BackupRestorePlanner', () => {
  it('blocks unsupported payload versions before creating a commit plan', async () => {
    const planner = new BackupRestorePlanner();
    const payload = {
      ...createPayload(),
      version: 999,
    } as unknown as AppBackupPayload;

    const result = await planner.execute({
      currentState: createPayload(),
      mode: 'merge',
      payload,
    });

    expect(result).toMatchObject({
      code: 'UNSUPPORTED_VERSION',
      ok: false,
      report: {
        plan: null,
        readyToCommit: false,
        status: 'blocked',
      },
    });
  });

  it('creates overwrite plans without conflicts and replaces target state', async () => {
    const planner = new BackupRestorePlanner();

    const result = await planner.execute({
      currentState: createPayload({
        settings: [createSetting('theme', 'light')],
      }),
      mode: 'overwrite',
      payload: createPayload({
        settings: [createSetting('theme', 'dark')],
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error('Expected restore plan to be ready');
    }

    expect(result.plan).toMatchObject({
      checkpointLabel: null,
      checkpointWriteRequested: false,
      conflicts: [],
      historyWriteRequested: true,
      mode: 'overwrite',
      targetState: {
        settings: [expect.objectContaining({ value: 'dark' })],
      },
    });
  });

  it('reports merge conflicts and lets imported records win in target state', async () => {
    const planner = new BackupRestorePlanner();

    const result = await planner.execute({
      checkpointRequested: true,
      currentState: createPayload({
        settings: [createSetting('theme', 'light')],
      }),
      mode: 'merge',
      payload: createPayload({
        settings: [createSetting('theme', 'dark')],
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error('Expected restore plan to be ready');
    }

    expect(result.plan).toMatchObject({
      checkpointLabel: 'restore:merge',
      checkpointWriteRequested: true,
      conflicts: [
        expect.objectContaining({
          code: 'MERGE_CONFLICT',
          path: 'settings/theme',
          scope: 'records',
          table: 'settings',
        }),
      ],
      targetState: {
        settings: [expect.objectContaining({ value: 'dark' })],
      },
    });
  });

  it('reports rebase conflicts and keeps current records in target state', async () => {
    const planner = new BackupRestorePlanner();

    const result = await planner.execute({
      currentState: createPayload({
        settings: [createSetting('theme', 'light')],
      }),
      mode: 'rebase',
      payload: createPayload({
        settings: [createSetting('theme', 'dark')],
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error('Expected restore plan to be ready');
    }

    expect(result.plan).toMatchObject({
      conflicts: [
        expect.objectContaining({
          code: 'REBASE_CONFLICT',
          path: 'settings/theme',
          scope: 'records',
          table: 'settings',
        }),
      ],
      targetState: {
        settings: [expect.objectContaining({ value: 'light' })],
      },
    });
  });
});
