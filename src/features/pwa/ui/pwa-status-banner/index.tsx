import { type ReactElement, useEffect, useRef, useState } from 'react';
import { Affix, Button, Group, List, Paper, Stack, Text } from '@mantine/core';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { appVersion } from '@/shared/config/app-version';
import type { ReleaseNotes } from '@/shared/config/release-notes';

const releaseNotesAssetUrl = `${import.meta.env.BASE_URL}release-notes.json`;

function isReleaseNotes(value: unknown): value is ReleaseNotes {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ReleaseNotes>;

  return (
    typeof candidate.version === 'string' &&
    typeof candidate.title === 'string' &&
    Array.isArray(candidate.changes) &&
    candidate.changes.every((change) => typeof change === 'string')
  );
}

async function fetchLatestReleaseNotes(): Promise<ReleaseNotes | null> {
  const response = await fetch(`${releaseNotesAssetUrl}?t=${Date.now()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const payload: unknown = await response.json();

  return isReleaseNotes(payload) ? payload : null;
}

export function PwaStatusBanner(): ReactElement | null {
  const intervalIdRef = useRef<number | null>(null);
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNotes | null>(null);
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

  useEffect(() => {
    let isActive = true;

    if (!needRefresh) {
      return () => {
        isActive = false;
      };
    }

    void (async () => {
      try {
        const notes = await fetchLatestReleaseNotes();

        if (isActive) {
          setReleaseNotes(notes);
        }
      } catch {
        if (isActive) {
          setReleaseNotes(null);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [needRefresh]);

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
          {needRefresh && releaseNotes !== null && (
            <Stack gap={4}>
              <Text fw={700} size="sm">
                Что изменилось в версии {releaseNotes.version}
              </Text>
              <Text c="dimmed" size="sm">
                {releaseNotes.title}
              </Text>
              <List c="dimmed" size="sm" spacing={2}>
                {releaseNotes.changes.slice(0, 3).map((change) => (
                  <List.Item key={change}>{change}</List.Item>
                ))}
              </List>
            </Stack>
          )}
          <Text c="dimmed" size="xs">
            Текущая версия {appVersion}
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
