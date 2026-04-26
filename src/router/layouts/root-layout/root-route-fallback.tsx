import type { ReactElement } from 'react';
import { Center, Loader } from '@mantine/core';

export function RootRouteFallback(): ReactElement {
  return (
    <Center
      aria-label="Загрузка приложения"
      className="root-loading-surface"
      component="section"
      mih="calc(100dvh - var(--sl-shell-footer-content-height) - var(--sl-shell-safe-area-inset-bottom))"
    >
      <Loader color="brand" size="lg" />
    </Center>
  );
}
