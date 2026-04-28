import type { ReactElement } from 'react';
import { Alert, Button, Text } from '@mantine/core';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
} from '@tabler/icons-react';

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
  if (visibleErrorMessage) {
    return (
      <Alert
        className={`${styles.inlineState} scanner-modal__inline-state scanner-modal__inline-state--error`}
        color="red"
        icon={<IconAlertCircle size={16} />}
        title={visibleErrorMessage}
        variant="light"
      >
        <Button
          color="red"
          onClick={onDismissError}
          size="compact-xs"
          variant="subtle"
        >
          Закрыть предупреждение
        </Button>
      </Alert>
    );
  }

  if (shouldRenderSuccessState && latestBufferItem !== null) {
    return (
      <Alert
        className={`${styles.inlineState} scanner-modal__inline-state scanner-modal__inline-state--success`}
        color="green"
        icon={<IconCheck size={16} />}
        title="Код добавлен в буфер"
        variant="light"
      >
        <Text size="sm">{latestBufferItem.value}</Text>
      </Alert>
    );
  }

  if (shouldRenderInlineStatusMessage && statusMessage !== null) {
    return (
      <Alert
        className={`${styles.inlineState} scanner-modal__inline-state scanner-modal__inline-state--warning scanner-modal__status-message`}
        color="yellow"
        icon={<IconAlertTriangle size={16} />}
        title="Дубликат"
        variant="light"
      >
        {statusMessage}
      </Alert>
    );
  }

  return <></>;
}
