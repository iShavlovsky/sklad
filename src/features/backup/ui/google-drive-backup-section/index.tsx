import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Group, Stack, Text } from '@mantine/core';
import {
  IconAlertCircle,
  IconBrandGoogleDrive,
  IconCloudUpload,
  IconFileCheck,
  IconRefresh,
} from '@tabler/icons-react';

import type {
  AppBackupPayload,
  BackupImportValidationResult,
} from '@/domain/backup';
import { useGoogleDriveBackup } from '@/features/backup/hooks/use-google-drive-backup';
import { useGoogleAccountConnection } from '@/features/google/hooks/use-google-account-connection';
import type { GoogleDriveBackupFileMetadata } from '@/features/google/model/google-account.types';
import { APP_ROUTES } from '@/shared/config/routes.ts';
import { useActionFeedback } from '@/shared/ui/action-feedback';
import { PageSection } from '@/shared/ui/page-section';

import { formatDateTime } from '../backup-workflow/backup-workflow.model.ts';

type GoogleDriveBackupSectionProps = {
  onValidatedPayload: (
    payload: AppBackupPayload,
    validation: BackupImportValidationResult
  ) => void;
  pendingActions: Set<string>;
};

function describeStorageMode(
  storageMode: GoogleDriveBackupFileMetadata['storageMode']
): string {
  return storageMode === 'visibleFolder'
    ? 'Папка SKLAD Backups'
    : 'Скрытое хранилище';
}

export function GoogleDriveBackupSection({
  onValidatedPayload,
  pendingActions,
}: Readonly<GoogleDriveBackupSectionProps>): ReactElement {
  const actionFeedback = useActionFeedback();
  const googleAccount = useGoogleAccountConnection();
  const googleDriveBackup = useGoogleDriveBackup();
  const isConnected = googleAccount.account !== null;
  const canUseDrive =
    isConnected &&
    googleAccount.configured &&
    googleAccount.isOnline &&
    googleAccount.tokenAccess.ok;

  async function handleUpload(): Promise<void> {
    pendingActions.add('google-upload');

    try {
      const result = await googleDriveBackup.upload();

      actionFeedback.notify({
        kind: result.ok ? 'success' : 'error',
        title: result.ok
          ? 'Backup сохранен в Google Drive'
          : 'Backup не сохранен',
        message: result.ok ? result.file.name : result.message,
      });
    } finally {
      pendingActions.delete('google-upload');
    }
  }

  async function handleList(): Promise<void> {
    pendingActions.add('google-list');

    try {
      const result = await googleDriveBackup.list();

      actionFeedback.notify({
        kind: result.ok ? 'success' : 'error',
        title: result.ok
          ? 'Список Google Drive обновлен'
          : 'Список не обновлен',
        message: result.ok
          ? `Найдено файлов: ${result.files.length}.`
          : result.message,
      });
    } finally {
      pendingActions.delete('google-list');
    }
  }

  async function handleDownload(
    file: GoogleDriveBackupFileMetadata
  ): Promise<void> {
    const pendingKey = `google-download-${file.id}`;
    pendingActions.add(pendingKey);

    try {
      const result = await googleDriveBackup.downloadAndValidate(file);

      if (!result.ok) {
        actionFeedback.notify({
          kind: 'error',
          title: 'Backup из Google Drive не проверен',
          message: result.message,
        });
        return;
      }

      onValidatedPayload(
        result.validationResult.payload,
        result.validationResult
      );
      actionFeedback.notify({
        kind: 'success',
        title: 'Backup из Google Drive проверен',
        message: result.validationResult.report.summary,
      });
    } finally {
      pendingActions.delete(pendingKey);
    }
  }

  return (
    <PageSection badge="Google Drive" title="Backup в Google Drive">
      <Stack gap="sm" data-testid="google-drive-backup-section">
        {!googleAccount.configured ? (
          <Alert
            color="yellow"
            icon={<IconAlertCircle size={16} />}
            variant="light"
          >
            Google Drive не настроен: добавьте VITE_GOOGLE_CLIENT_ID.
          </Alert>
        ) : null}

        {!isConnected ? (
          <Alert
            color="blue"
            icon={<IconBrandGoogleDrive size={16} />}
            variant="light"
          >
            Подключите Google аккаунт в профиле, чтобы сохранять backup в Drive.
            <Button
              component={Link}
              fullWidth
              mt="sm"
              size="xs"
              to={APP_ROUTES.settingsProfile}
              variant="light"
            >
              Перейти в профиль
            </Button>
          </Alert>
        ) : null}

        {isConnected && !googleAccount.isOnline ? (
          <Alert
            color="yellow"
            icon={<IconAlertCircle size={16} />}
            variant="light"
          >
            Google Drive недоступен офлайн. Локальный backup JSON остается
            доступен.
          </Alert>
        ) : null}

        {isConnected ? (
          <Stack gap="sm">
            <Group gap="xs" wrap="wrap">
              <Badge color="blue" variant="light">
                {googleAccount.account?.email}
              </Badge>
              <Badge color="teal" variant="light">
                {describeStorageMode(googleAccount.storageMode)}
              </Badge>
            </Group>

            {!googleAccount.tokenAccess.ok ? (
              <Alert
                color="yellow"
                icon={<IconAlertCircle size={16} />}
                variant="light"
              >
                {googleAccount.tokenAccess.message}
              </Alert>
            ) : null}

            <Group grow>
              <Button
                disabled={!canUseDrive}
                leftSection={<IconCloudUpload size={16} />}
                loading={pendingActions.has('google-upload')}
                onClick={() => {
                  void handleUpload();
                }}
              >
                Сохранить в Drive
              </Button>
              <Button
                disabled={!canUseDrive}
                leftSection={<IconRefresh size={16} />}
                loading={pendingActions.has('google-list')}
                variant="light"
                onClick={() => {
                  void handleList();
                }}
              >
                Обновить список
              </Button>
            </Group>

            <Stack gap="xs">
              {googleAccount.recentFiles.length === 0 ? (
                <Text c="dimmed" size="sm">
                  Файлов Google Drive пока нет.
                </Text>
              ) : (
                googleAccount.recentFiles.map((file) => (
                  <Group
                    data-testid="google-drive-backup-file"
                    gap="xs"
                    justify="space-between"
                    key={file.id}
                    wrap="nowrap"
                  >
                    <Stack gap={2} miw={0}>
                      <Text fw={700} size="sm" truncate="end">
                        {file.name}
                      </Text>
                      <Text c="dimmed" size="xs" truncate="end">
                        {describeStorageMode(file.storageMode)}
                        {file.modifiedTime
                          ? ` · ${formatDateTime(file.modifiedTime)}`
                          : ''}
                      </Text>
                    </Stack>
                    <Button
                      disabled={!canUseDrive}
                      leftSection={<IconFileCheck size={14} />}
                      loading={pendingActions.has(`google-download-${file.id}`)}
                      size="xs"
                      variant="light"
                      onClick={() => {
                        void handleDownload(file);
                      }}
                    >
                      Скачать и проверить
                    </Button>
                  </Group>
                ))
              )}
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </PageSection>
  );
}
