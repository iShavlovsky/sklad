import { type ReactElement, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  FileInput,
  Group,
  LoadingOverlay,
  Radio,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';

import type {
  AppBackupPayload,
  BackupImportValidationResult,
  BackupRestoreMode,
} from '@/domain/backup';
import { APP_BACKUP_PAYLOAD_VERSION } from '@/domain/backup';
import { useBackupCheckpointList } from '@/features/backup/hooks/use-backup-checkpoint-list.ts';
import { useBackupExport } from '@/features/backup/hooks/use-backup-export.ts';
import { useBackupHistoryList } from '@/features/backup/hooks/use-backup-history-list.ts';
import { useBackupImportValidation } from '@/features/backup/hooks/use-backup-import-validation.ts';
import { useBackupRestore } from '@/features/backup/hooks/use-backup-restore.ts';
import { useCreateBackupCheckpoint } from '@/features/backup/hooks/use-create-backup-checkpoint.ts';
import {
  BottomSpacer,
  PageContainer,
  SectionStack,
} from '@/shared/ui/page-primitives';
import { PageSection } from '@/shared/ui/page-section';

type BackupActionStatus = {
  tone: 'success' | 'error' | 'info';
  title: string;
  message: string;
};

const restoreModes: Array<{
  value: BackupRestoreMode;
  label: string;
  description: string;
}> = [
  {
    value: 'overwrite',
    label: 'Заменить',
    description: 'Заменяет first data состоянием из файла.',
  },
  {
    value: 'merge',
    label: 'Объединить',
    description: 'Добавляет импорт и заменяет совпадающие записи.',
  },
  {
    value: 'rebase',
    label: 'Сохранить текущее',
    description: 'Добавляет только то, чего ещё нет в текущей базе.',
  },
];

function createEmptyBackupPayload(): AppBackupPayload {
  return {
    exportedAt: new Date(0).toISOString(),
    version: APP_BACKUP_PAYLOAD_VERSION,
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
}

function formatDateTime(value: string): string {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(timestamp);
}

function summarizeValidation(
  validation: BackupImportValidationResult | null
): string {
  if (validation === null) {
    return 'Файл ещё не проверен.';
  }

  if (!validation.ok || validation.report.counts === null) {
    return validation.report.summary;
  }

  const { counts } = validation.report;

  return [
    `приходы: ${counts.arrivals}`,
    `расходы: ${counts.departures}`,
    `черновики: ${counts.drafts}`,
    `коды: ${counts.recordCodes}`,
    `настройки: ${counts.settings}`,
  ].join(', ');
}

export function SettingsBackupPage(): ReactElement {
  const backupExport = useBackupExport();
  const importValidation = useBackupImportValidation();
  const backupRestore = useBackupRestore();
  const checkpointService = useCreateBackupCheckpoint();
  const checkpoints = useBackupCheckpointList();
  const history = useBackupHistoryList();

  const [status, setStatus] = useState<BackupActionStatus | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validatedPayload, setValidatedPayload] =
    useState<AppBackupPayload | null>(null);
  const [validationResult, setValidationResult] =
    useState<BackupImportValidationResult | null>(null);
  const [restoreMode, setRestoreMode] =
    useState<BackupRestoreMode>('overwrite');
  const [checkpointLabel, setCheckpointLabel] = useState('Ручной checkpoint');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const latestHistory = useMemo(() => history.slice(0, 5), [history]);
  const latestCheckpoints = useMemo(
    () => checkpoints.slice(0, 5),
    [checkpoints]
  );

  async function handleExport(): Promise<void> {
    setPendingAction('export');
    setStatus(null);

    try {
      const result = await backupExport.saveToFile();

      if (!result.ok) {
        setStatus({
          tone: 'error',
          title: 'Экспорт не выполнен',
          message: result.message,
        });
        return;
      }

      setStatus({
        tone: 'success',
        title: 'Экспорт подготовлен',
        message: `Файл ${result.fileResult.fileName} содержит first data и не включает sklad-buffer.`,
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleCreateCheckpoint(): Promise<void> {
    const label = checkpointLabel.trim();

    if (label.length === 0) {
      setStatus({
        tone: 'error',
        title: 'Checkpoint не создан',
        message: 'Укажите название checkpoint.',
      });
      return;
    }

    setPendingAction('checkpoint');
    setStatus(null);

    try {
      const exportResult = await backupExport.execute();

      if (!exportResult.ok) {
        setStatus({
          tone: 'error',
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
        setStatus({
          tone: 'error',
          title: 'Checkpoint не создан',
          message: 'IndexedDB не приняла checkpoint.',
        });
        return;
      }

      setStatus({
        tone: 'success',
        title: 'Checkpoint создан',
        message: checkpointResult.report.summary,
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleValidateImport(file: File | null): Promise<void> {
    setSelectedFile(file);
    setValidatedPayload(null);
    setValidationResult(null);

    if (file === null) {
      setStatus(null);
      return;
    }

    setPendingAction('validate');
    setStatus(null);

    try {
      const result = await importValidation.validateFromFile(file);

      if (!result.ok) {
        setStatus({
          tone: 'error',
          title: 'Файл не прочитан',
          message: result.fileResult.message,
        });
        return;
      }

      setValidationResult(result.validationResult);

      if (!result.validationResult.ok) {
        setStatus({
          tone: 'error',
          title: 'Backup не прошёл проверку',
          message: result.validationResult.report.summary,
        });
        return;
      }

      setValidatedPayload(result.validationResult.payload);
      setStatus({
        tone: 'success',
        title: 'Backup готов к восстановлению',
        message: summarizeValidation(result.validationResult),
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleRestore(): Promise<void> {
    if (validatedPayload === null) {
      setStatus({
        tone: 'error',
        title: 'Восстановление недоступно',
        message: 'Сначала выберите и проверьте backup JSON.',
      });
      return;
    }

    setPendingAction('restore');
    setStatus(null);

    try {
      const result = await backupRestore.execute({
        payload: validatedPayload,
        currentState: createEmptyBackupPayload(),
        mode: restoreMode,
        checkpointRequested: true,
      });

      if (!result.ok) {
        setStatus({
          tone: 'error',
          title: 'Восстановление не выполнено',
          message:
            'report' in result
              ? result.report.summary
              : 'IndexedDB не приняла восстановление.',
        });
        return;
      }

      setStatus({
        tone: 'success',
        title: 'Восстановление выполнено',
        message: `${result.report.summary}. Перед восстановлением создан checkpoint.`,
      });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <PageContainer>
      <SectionStack>
        <PageSection badge="Резервные копии" title="Экспорт и восстановление">
          <Stack gap="md" pos="relative">
            <LoadingOverlay
              visible={pendingAction !== null}
              overlayProps={{ blur: 1, radius: 'sm' }}
            />

            {status && (
              <Alert
                color={
                  status.tone === 'success'
                    ? 'green'
                    : status.tone === 'error'
                      ? 'red'
                      : 'blue'
                }
                title={status.title}
                variant="light"
              >
                {status.message}
              </Alert>
            )}

            <Group align="end" gap="sm" wrap="wrap">
              <Button
                loading={pendingAction === 'export'}
                onClick={() => {
                  void handleExport();
                }}
              >
                Скачать backup JSON
              </Button>
              <Text c="dimmed" size="xs">
                Экспортирует durable first data и metadata backup.
              </Text>
            </Group>

            <Stack gap="xs">
              <FileInput
                accept="application/json,.json"
                clearable
                label="Файл backup"
                placeholder="Выберите JSON"
                value={selectedFile}
                onChange={(file) => {
                  void handleValidateImport(file);
                }}
              />
              <Text c="dimmed" size="xs">
                Проверка не меняет IndexedDB.{' '}
                {summarizeValidation(validationResult)}
              </Text>
            </Stack>

            <Radio.Group
              label="Режим восстановления"
              value={restoreMode}
              onChange={(value) => {
                setRestoreMode(value as BackupRestoreMode);
              }}
            >
              <Stack gap="xs" mt="xs">
                {restoreModes.map((mode) => (
                  <Radio
                    description={mode.description}
                    key={mode.value}
                    label={mode.label}
                    value={mode.value}
                  />
                ))}
              </Stack>
            </Radio.Group>

            <Group align="end" gap="sm" wrap="wrap">
              <Button
                color="red"
                disabled={validatedPayload === null}
                loading={pendingAction === 'restore'}
                onClick={() => {
                  void handleRestore();
                }}
              >
                Восстановить из backup
              </Button>
              <Text c="dimmed" size="xs">
                Restore создаёт checkpoint перед commit и пишет history record.
              </Text>
            </Group>
          </Stack>
        </PageSection>

        <PageSection badge="Checkpoint" title="Ручной checkpoint">
          <Stack gap="sm">
            <TextInput
              label="Название"
              value={checkpointLabel}
              onChange={(event) => {
                setCheckpointLabel(event.currentTarget.value);
              }}
            />
            <Group align="end" gap="sm" wrap="wrap">
              <Button
                loading={pendingAction === 'checkpoint'}
                onClick={() => {
                  void handleCreateCheckpoint();
                }}
              >
                Сохранить checkpoint
              </Button>
              <Text c="dimmed" size="xs">
                Snapshot создаётся из текущего backup export payload.
              </Text>
            </Group>
          </Stack>
        </PageSection>

        <PageSection badge="История" title="Журнал backup">
          <Stack gap="sm">
            {latestHistory.length === 0 ? (
              <Text c="dimmed" size="sm">
                История backup операций пока пуста.
              </Text>
            ) : (
              latestHistory.map((entry) => (
                <Stack gap={4} key={entry.id}>
                  <Group gap="xs" wrap="wrap">
                    <Badge variant="light">{entry.action}</Badge>
                    <Badge color={entry.status === 'success' ? 'green' : 'red'}>
                      {entry.status}
                    </Badge>
                    <Text c="dimmed" size="xs">
                      {formatDateTime(entry.createdAt)}
                    </Text>
                  </Group>
                  <Text size="sm">{entry.summary}</Text>
                </Stack>
              ))
            )}
          </Stack>
        </PageSection>

        <PageSection badge="Checkpoints" title="Последние checkpoints">
          <Stack gap="sm">
            {latestCheckpoints.length === 0 ? (
              <Text c="dimmed" size="sm">
                Checkpoint ещё не создан.
              </Text>
            ) : (
              latestCheckpoints.map((checkpoint) => (
                <Stack gap={4} key={checkpoint.id}>
                  <Group gap="xs" wrap="wrap">
                    <Badge variant="light">{checkpoint.label}</Badge>
                    <Text c="dimmed" size="xs">
                      {formatDateTime(checkpoint.createdAt)}
                    </Text>
                  </Group>
                  <Text c="dimmed" size="xs">
                    Версия payload: {checkpoint.snapshot.version}
                  </Text>
                </Stack>
              ))
            )}
          </Stack>
        </PageSection>
      </SectionStack>

      <BottomSpacer />
    </PageContainer>
  );
}
