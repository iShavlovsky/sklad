import type { ReactElement } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Group,
  SegmentedControl,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconBrandGoogle,
  IconPlugConnected,
} from '@tabler/icons-react';

import { useActionFeedback } from '@/shared/ui/action-feedback';
import { PageSection } from '@/shared/ui/page-section';

import { useGoogleAccountConnection } from '../../hooks/use-google-account-connection';

export function GoogleAccountSection(): ReactElement {
  const actionFeedback = useActionFeedback();
  const googleAccount = useGoogleAccountConnection();
  const isConnected = googleAccount.account !== null;
  const canUseNetworkActions =
    googleAccount.configured && googleAccount.isOnline;
  const driveStatus = googleAccount.tokenAccess.ok
    ? 'Доступ к Drive активен'
    : 'Нужно обновить доступ';

  async function handleConnect(): Promise<void> {
    const result = await googleAccount.connect('base');

    actionFeedback.notify({
      kind: result.ok ? 'success' : 'warning',
      title: result.ok ? 'Google подключен' : 'Google не подключен',
      message: result.ok
        ? 'Аккаунт готов для backup в Google Drive.'
        : result.message,
    });
  }

  async function handleRefresh(): Promise<void> {
    const result = await googleAccount.connect(
      googleAccount.storageMode === 'visibleFolder' ? 'visibleFolder' : 'base'
    );

    actionFeedback.notify({
      kind: result.ok ? 'success' : 'warning',
      title: result.ok ? 'Доступ обновлен' : 'Доступ не обновлен',
      message: result.ok ? 'Google Drive снова доступен.' : result.message,
    });
  }

  async function handleDisconnect(): Promise<void> {
    await googleAccount.disconnect();
    actionFeedback.notify({
      kind: 'success',
      title: 'Google отключен',
      message: 'Данные подключения удалены из профиля.',
    });
  }

  async function handleStorageModeChange(value: string): Promise<void> {
    const nextMode =
      value === 'visibleFolder' ? 'visibleFolder' : 'appDataFolder';
    const result = await googleAccount.setStorageMode(nextMode);

    actionFeedback.notify({
      kind: result.ok ? 'success' : 'warning',
      title: result.ok ? 'Режим Google Drive обновлен' : 'Режим не изменен',
      message: result.ok
        ? nextMode === 'visibleFolder'
          ? 'Backup будет сохраняться в папку SKLAD Backups.'
          : 'Backup будет сохраняться в скрытое хранилище приложения.'
        : result.message,
    });
  }

  return (
    <PageSection badge="Google" title="Google аккаунт">
      <Stack gap="sm">
        {!googleAccount.configured ? (
          <Alert
            color="yellow"
            icon={<IconAlertCircle size={16} />}
            variant="light"
          >
            Google Drive не настроен: добавьте VITE_GOOGLE_CLIENT_ID.
          </Alert>
        ) : null}

        {!googleAccount.isOnline ? (
          <Alert
            color="yellow"
            icon={<IconAlertCircle size={16} />}
            variant="light"
          >
            Google Drive недоступен офлайн. Локальный backup работает.
          </Alert>
        ) : null}

        {!isConnected ? (
          <Stack gap="xs">
            <Text c="dimmed" size="sm">
              Нужен только для backup в Google Drive.
            </Text>
            <Button
              data-testid="google-connect-button"
              disabled={!canUseNetworkActions}
              leftSection={<IconBrandGoogle size={16} />}
              onClick={() => {
                void handleConnect();
              }}
            >
              Подключить Google
            </Button>
          </Stack>
        ) : (
          <Stack gap="sm">
            <Group gap="sm" wrap="nowrap">
              <Avatar src={googleAccount.account?.picture} radius="xl" />
              <Stack gap={2} miw={0}>
                <Text fw={700} size="sm" truncate="end">
                  {googleAccount.account?.name}
                </Text>
                <Text c="dimmed" size="xs" truncate="end">
                  {googleAccount.account?.email}
                </Text>
              </Stack>
            </Group>

            <Group gap="xs" wrap="wrap">
              <Badge
                color={googleAccount.isOnline ? 'teal' : 'red'}
                variant="light"
              >
                {googleAccount.isOnline ? 'Онлайн' : 'Офлайн'}
              </Badge>
              <Badge
                color={googleAccount.tokenAccess.ok ? 'teal' : 'yellow'}
                leftSection={<IconPlugConnected size={12} />}
                variant="light"
              >
                {driveStatus}
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

            <SegmentedControl
              data={[
                { label: 'Скрытое хранилище', value: 'appDataFolder' },
                { label: 'Папка в Drive', value: 'visibleFolder' },
              ]}
              data-testid="google-storage-mode-control"
              disabled={!canUseNetworkActions}
              fullWidth
              value={googleAccount.storageMode}
              onChange={(value) => {
                void handleStorageModeChange(value);
              }}
            />

            {googleAccount.storageMode === 'visibleFolder' ? (
              <Text c="dimmed" size="xs">
                Файлы будут видны в папке SKLAD Backups.
              </Text>
            ) : (
              <Text c="dimmed" size="xs">
                Файлы скрыты в хранилище приложения Google Drive.
              </Text>
            )}

            <Group grow>
              <Button
                disabled={!canUseNetworkActions}
                variant="light"
                onClick={() => {
                  void handleRefresh();
                }}
              >
                Обновить доступ
              </Button>
              <Button
                color="red"
                variant="light"
                onClick={() => void handleDisconnect()}
              >
                Отключить
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </PageSection>
  );
}
