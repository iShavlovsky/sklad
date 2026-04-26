import { type ReactElement, useEffect, useRef } from 'react';
import { Affix, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { appVersion } from '@/shared/config/app-version';

export function PwaStatusBanner(): ReactElement | null {
  const intervalIdRef = useRef<number | null>(null);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      intervalIdRef.current = window?.setInterval(
        () => void registration.update(),
        15 * 60 * 1000
      );
    },
  });

  useEffect(() => {
    return () => {
      if (intervalIdRef.current !== null)
        window?.clearInterval(intervalIdRef.current);
    };
  }, []);

  const close = (): void => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  if (!needRefresh && !offlineReady) return null;

  return (
    <Affix
      position={{
        bottom:
          'calc(var(--sl-shell-footer-content-height) + var(--sl-shell-safe-area-inset-bottom) + 0.75rem)',
        left: '0.75rem',
        right: '0.75rem',
      }}
      zIndex={200}
    >
      <Paper
        bd="1px solid var(--sl-shell-border)"
        bg="var(--sl-surface-card)"
        p="md"
        radius="xl"
        shadow="lg"
      >
        <Stack gap="xs">
          <Text fw={700}>
            {offlineReady
              ? 'Приложение готово к офлайн-работе'
              : 'Доступна новая версия'}
          </Text>
          <Text c="dimmed" size="sm">
            {offlineReady
              ? 'Можно продолжать работу в локальном режиме даже без подключения.'
              : 'Перезагрузите приложение, чтобы получить актуальную версию.'}
          </Text>
          <Text c="dimmed" size="xs">
            Версия {appVersion}
          </Text>
          <Group justify="flex-end">
            <Button onClick={close} size="xs" variant="subtle">
              OK
            </Button>
            {needRefresh && (
              <Button
                onClick={() => {
                  void updateServiceWorker(true);
                }}
                size="xs"
              >
                Обновить
              </Button>
            )}
          </Group>
        </Stack>
      </Paper>
    </Affix>
  );
}
