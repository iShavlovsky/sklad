import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  BackupCheckpointRecord,
  BackupHistoryRecord,
} from '../../../../src/domain/backup';

const captured = vi.hoisted(() => ({
  activityEntries: [] as unknown[],
  operationsEntries: [] as BackupHistoryRecord[],
}));

const mockedData = vi.hoisted(() => ({
  checkpoints: [] as BackupCheckpointRecord[],
  history: [] as BackupHistoryRecord[],
}));

function passthrough(): null {
  return null;
}

vi.mock(
  '../../../../src/features/backup/hooks/use-backup-checkpoint-list.ts',
  () => ({
    useBackupCheckpointList: (): BackupCheckpointRecord[] =>
      mockedData.checkpoints,
  })
);

vi.mock(
  '../../../../src/features/backup/hooks/use-backup-history-list.ts',
  () => ({
    useBackupHistoryList: (): BackupHistoryRecord[] => mockedData.history,
  })
);

vi.mock('../../../../src/features/backup/hooks/use-backup-export.ts', () => ({
  useBackupExport: () => ({
    execute: vi.fn(),
    saveToFile: vi.fn(),
  }),
}));

vi.mock(
  '../../../../src/features/backup/hooks/use-backup-import-validation.ts',
  () => ({
    useBackupImportValidation: () => ({
      validateFromFile: vi.fn(),
    }),
  })
);

vi.mock('../../../../src/features/backup/hooks/use-backup-restore.ts', () => ({
  useBackupRestore: () => ({
    execute: vi.fn(),
  }),
}));

vi.mock(
  '../../../../src/features/backup/hooks/use-create-backup-checkpoint.ts',
  () => ({
    useCreateBackupCheckpoint: () => ({
      execute: vi.fn(),
    }),
  })
);

vi.mock('../../../../src/shared/ui/action-feedback', () => ({
  useActionFeedback: () => ({
    notify: vi.fn(),
  }),
}));

vi.mock(
  '../../../../src/features/backup/ui/backup-workflow/backup-history-section.tsx',
  () => ({
    BackupActivityTimelineSection: ({
      entries,
    }: {
      entries: unknown[];
    }): ReactNode => {
      captured.activityEntries = entries;
      return null;
    },
    BackupOperationsTimelineSection: ({
      entries,
    }: {
      entries: BackupHistoryRecord[];
    }): ReactNode => {
      captured.operationsEntries = entries;
      return null;
    },
  })
);

vi.mock(
  '../../../../src/features/backup/ui/backup-workflow/backup-workflow.checkpoint-section.tsx',
  () => ({
    BackupWorkflowCheckpointSection: passthrough,
  })
);

vi.mock(
  '../../../../src/features/backup/ui/backup-workflow/backup-workflow.export-restore-section.tsx',
  () => ({
    BackupWorkflowExportRestoreSection: passthrough,
  })
);

vi.mock(
  '../../../../src/features/backup/ui/google-drive-backup-section',
  () => ({
    GoogleDriveBackupSection: passthrough,
  })
);

import { BackupWorkflow } from '../../../../src/features/backup/ui/backup-workflow/backup-workflow.tsx';

describe('BackupWorkflow timeline separation', () => {
  beforeEach(() => {
    captured.activityEntries = [];
    captured.operationsEntries = [];
    mockedData.checkpoints = [];
    mockedData.history = [];
  });

  it('keeps a user export after a checkpoint in the backup operations timeline', () => {
    mockedData.checkpoints = [
      {
        createdAt: '2026-04-27T20:00:05.000Z',
        id: 'checkpoint-1',
        label: 'Manual checkpoint',
        snapshot: {
          arrivals: [],
          backupCheckpoints: [],
          backupHistory: [],
          categories: [],
          departures: [],
          drafts: [],
          exportedAt: '2026-04-27T20:00:00.000Z',
          favorites: [],
          products: [],
          profiles: [],
          recordCodes: [],
          settings: [],
          suppliers: [],
          version: 1,
        },
      },
    ];
    mockedData.history = [
      {
        action: 'export',
        createdAt: '2026-04-27T20:00:00.000Z',
        details: null,
        id: 'internal-checkpoint-export',
        status: 'success',
        summary: 'Exported internal checkpoint snapshot',
      },
      {
        action: 'export',
        createdAt: '2026-04-27T20:00:10.000Z',
        details: null,
        id: 'user-export-after-checkpoint',
        status: 'success',
        summary: 'Exported user backup',
      },
    ];

    renderToStaticMarkup(createElement(BackupWorkflow));

    expect(captured.operationsEntries.map((entry) => entry.id)).toEqual([
      'user-export-after-checkpoint',
    ]);
    expect(captured.activityEntries).toHaveLength(2);
  });
});
