import type { ReactElement } from 'react';
import { Button, Paper, Text } from '@mantine/core';

import styles from '../styles.module.css';

type ScannerModalInlineStateProps = {
  latestBufferItem: { value: string } | null;
  shouldRenderInlineStatusMessage: boolean;
  shouldRenderSuccessState: boolean;
  statusMessage: string | null;
  visibleErrorMessage: string | null;
  onDismissError: () => void;
};

export function ScannerModalInlineState({
  latestBufferItem,
  shouldRenderInlineStatusMessage,
  shouldRenderSuccessState,
  statusMessage,
  visibleErrorMessage,
  onDismissError,
}: Readonly<ScannerModalInlineStateProps>): ReactElement {
  return (
    <>
      {visibleErrorMessage && (
        <Paper
          className={`${styles.inlineState} scanner-modal__inline-state scanner-modal__inline-state--error`}
          component="div"
          data-tone="error"
          p="xs"
          radius="md"
          withBorder
        >
          <div>
            <Text fw={700} size="sm">
              {visibleErrorMessage}
            </Text>
          </div>
          <Button
            color="red"
            onClick={onDismissError}
            size="compact-xs"
            variant="subtle"
          >
            Закрыть предупреждение
          </Button>
        </Paper>
      )}

      {shouldRenderSuccessState && latestBufferItem !== null && (
        <Paper
          className={`${styles.inlineState} scanner-modal__inline-state scanner-modal__inline-state--success`}
          component="div"
          data-tone="success"
          p="xs"
          radius="md"
          withBorder
        >
          <div>
            <Text fw={700} size="sm">
              Код добавлен в буфер
            </Text>
            <Text size="sm">{latestBufferItem.value}</Text>
          </div>
        </Paper>
      )}

      {shouldRenderInlineStatusMessage && (
        <Text
          className={`${styles.statusMessage} scanner-modal__status-message`}
          size="sm"
        >
          {statusMessage}
        </Text>
      )}
    </>
  );
}
