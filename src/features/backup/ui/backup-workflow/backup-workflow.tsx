import { type ReactElement, useMemo, useState } from 'react';
import { useSet } from '@mantine/hooks';

import type {
  AppBackupPayload,
  BackupCheckpointRecord,
  BackupHistoryRecord,
  BackupImportValidationResult,
  BackupRestoreMode,
} from '@/domain/backup';
import { useActionFeedback } from '@/shared/ui/action-feedback';

import { useBackupCheckpointList } from '../../hooks/use-backup-checkpoint-list.ts';
import { useBackupExport } from '../../hooks/use-backup-export.ts';
import { useBackupHistoryList } from '../../hooks/use-backup-history-list.ts';
import { useBackupImportValidation } from '../../hooks/use-backup-import-validation.ts';
import { useBackupRestore } from '../../hooks/use-backup-restore.ts';
import { useCreateBackupCheckpoint } from '../../hooks/use-create-backup-checkpoint.ts';
import { GoogleDriveBackupSection } from '../google-drive-backup-section';

import {
  type BackupActivityEntry,
  BackupActivityTimelineSection,
  BackupOperationsTimelineSection,
} from './backup-history-section.tsx';
import { BackupWorkflowCheckpointSection } from './backup-workflow.checkpoint-section.tsx';
import { BackupWorkflowExportRestoreSection } from './backup-workflow.export-restore-section.tsx';
import {
  CHECKPOINT_EXPORT_PAIRING_WINDOW_MS,
  createEmptyBackupPayload,
  summarizeValidation,
} from './backup-workflow.model.ts';

function isCheckpointSnapshotExport(
  entry: BackupHistoryRecord,
  checkpoints: BackupCheckpointRecord[]
): boolean {
  if (entry.action !== 'export') {
    return false;
  }

  const entryTimestamp = Date.parse(entry.createdAt);

  if (Number.isNaN(entryTimestamp)) {
    return false;
  }

  return checkpoints.some((checkpoint) => {
    const checkpointTimestamp = Date.parse(checkpoint.createdAt);

    return (
      !Number.isNaN(checkpointTimestamp) &&
      entryTimestamp <= checkpointTimestamp &&
      Math.abs(entryTimestamp - checkpointTimestamp) <=
        CHECKPOINT_EXPORT_PAIRING_WINDOW_MS
    );
  });
}

function toActivityEntries(
  backupEntries: BackupHistoryRecord[],
  checkpoints: BackupCheckpointRecord[]
): BackupActivityEntry[] {
  return [
    ...backupEntries.map(
      (record): BackupActivityEntry => ({ kind: 'backup', record })
    ),
    ...checkpoints.map(
      (record): BackupActivityEntry => ({ kind: 'checkpoint', record })
    ),
  ]
    .sort((left, right) => {
      const leftDate =
        left.kind === 'backup' ? left.record.createdAt : left.record.createdAt;
      const rightDate =
        right.kind === 'backup'
          ? right.record.createdAt
          : right.record.createdAt;

      return Date.parse(rightDate) - Date.parse(leftDate);
    })
    .slice(0, 8);
}

export function BackupWorkflow(): ReactElement {
  const actionFeedback = useActionFeedback();
  const backupExport = useBackupExport();
  const importValidation = useBackupImportValidation();
  const backupRestore = useBackupRestore();
  const checkpointService = useCreateBackupCheckpoint();
  const checkpoints = useBackupCheckpointList();
  const history = useBackupHistoryList();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validatedPayload, setValidatedPayload] =
    useState<AppBackupPayload | null>(null);
  const [validationResult, setValidationResult] =
    useState<BackupImportValidationResult | null>(null);
  const [restoreMode, setRestoreMode] =
    useState<BackupRestoreMode>('overwrite');
  const [checkpointLabel, setCheckpointLabel] = useState('Ручной checkpoint');
  const pendingActions = useSet<string>();

  const backupOperationHistory = useMemo(
    () =>
      history
        .filter((entry) => !isCheckpointSnapshotExport(entry, checkpoints))
        .slice(0, 5),
    [checkpoints, history]
  );
  const activityEntries = useMemo(
    () => toActivityEntries(backupOperationHistory, checkpoints),
    [backupOperationHistory, checkpoints]
  );

  async function handleExport(): Promise<void> {
    pendingActions.add('export');

    try {
      const result = await backupExport.saveToFile();

      if (!result.ok) {
        actionFeedback.notify({
          kind: 'error',
          title: 'Экспорт не выполнен',
          message: result.message,
        });
        return;
      }

      actionFeedback.notify({
        kind: 'success',
        title: 'Экспорт подготовлен',
        message: `Файл ${result.fileResult.fileName} содержит first data и не включает sklad-buffer.`,
      });
    } finally {
      pendingActions.delete('export');
    }
  }

  async function handleCreateCheckpoint(): Promise<void> {
    const label = checkpointLabel.trim();

    if (label.length === 0) {
      actionFeedback.notify({
        kind: 'error',
        title: 'Checkpoint не создан',
        message: 'Укажите название checkpoint.',
      });
      return;
    }

    pendingActions.add('checkpoint');

    try {
      const exportResult = await backupExport.execute();

      if (!exportResult.ok) {
        actionFeedback.notify({
          kind: 'error',
          title: 'Checkpoint не создан',
          message: 'Не удалось подготовить текущий backup snapshot.',
        });
        return;
      }

      const checkpointResult = await checkpointService.execute({
        label,
        snapshot: exportResult.payload,
      });

      if (!checkpointResult.ok) {
        actionFeedback.notify({
          kind: 'error',
          title: 'Checkpoint не создан',
          message: 'IndexedDB не приняла checkpoint.',
        });
        return;
      }

      actionFeedback.notify({
        kind: 'success',
        title: 'Checkpoint создан',
        message: checkpointResult.report.summary,
      });
    } finally {
      pendingActions.delete('checkpoint');
    }
  }

  async function handleValidateImport(file: File | null): Promise<void> {
    setSelectedFile(file);
    setValidatedPayload(null);
    setValidationResult(null);

    if (file === null) {
      return;
    }

    pendingActions.add('validate');

    try {
      const result = await importValidation.validateFromFile(file);

      if (!result.ok) {
        actionFeedback.notify({
          kind: 'error',
          title: 'Файл не прочитан',
          message: result.fileResult.message,
        });
        return;
      }

      setValidationResult(result.validationResult);

      if (!result.validationResult.ok) {
        actionFeedback.notify({
          kind: 'error',
          title: 'Backup не прошел проверку',
          message: result.validationResult.report.summary,
        });
        return;
      }

      setValidatedPayload(result.validationResult.payload);
      actionFeedback.notify({
        kind: 'success',
        title: 'Backup готов к восстановлению',
        message: summarizeValidation(result.validationResult),
      });
    } finally {
      pendingActions.delete('validate');
    }
  }

  async function handleRestore(): Promise<void> {
    if (validatedPayload === null) {
      actionFeedback.notify({
        kind: 'error',
        title: 'Восстановление недоступно',
        message: 'Сначала выберите и проверьте backup JSON.',
      });
      return;
    }

    pendingActions.add('restore');

    try {
      const result = await backupRestore.execute({
        payload: validatedPayload,
        currentState: createEmptyBackupPayload(),
        mode: restoreMode,
        checkpointRequested: true,
      });

      if (!result.ok) {
        actionFeedback.notify({
          kind: 'error',
          title: 'Восстановление не выполнено',
          message:
            'report' in result
              ? result.report.summary
              : 'IndexedDB не приняла восстановление.',
        });
        return;
      }

      actionFeedback.notify({
        kind: 'success',
        title: 'Восстановление выполнено',
        message: `${result.report.summary}. Перед восстановлением создан checkpoint.`,
      });
    } finally {
      pendingActions.delete('restore');
    }
  }

  return (
    <>
      <BackupWorkflowExportRestoreSection
        isRestoreDisabled={validatedPayload === null}
        pendingActions={pendingActions}
        restoreMode={restoreMode}
        selectedFile={selectedFile}
        validationResult={validationResult}
        onExport={() => {
          void handleExport();
        }}
        onRestore={() => {
          void handleRestore();
        }}
        onRestoreModeChange={setRestoreMode}
        onValidateImport={(file) => {
          void handleValidateImport(file);
        }}
      />

      <GoogleDriveBackupSection
        pendingActions={pendingActions}
        onValidatedPayload={(payload, validation) => {
          setValidatedPayload(payload);
          setValidationResult(validation);
          setSelectedFile(null);
        }}
      />

      <BackupWorkflowCheckpointSection
        checkpointLabel={checkpointLabel}
        isCreating={pendingActions.has('checkpoint')}
        onCheckpointLabelChange={setCheckpointLabel}
        onCreateCheckpoint={() => {
          void handleCreateCheckpoint();
        }}
      />

      <BackupOperationsTimelineSection entries={backupOperationHistory} />

      <BackupActivityTimelineSection entries={activityEntries} />
    </>
  );
}
