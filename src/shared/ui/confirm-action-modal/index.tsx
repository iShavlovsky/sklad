import type { ReactElement } from 'react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface ConfirmActionModalProps {
  confirmColor?: string;
  confirmLabel: string;
  description: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  opened: boolean;
  title: string;
}

export function ConfirmActionModal({
  confirmColor = 'red',
  confirmLabel,
  description,
  loading = false,
  onClose,
  onConfirm,
  opened,
  title,
}: Readonly<ConfirmActionModalProps>): ReactElement {
  return (
    <Modal centered onClose={onClose} opened={opened} title={title}>
      <Stack gap="md">
        <Text c="dimmed" size="sm">
          {description}
        </Text>
        <Group justify="flex-end">
          <Button onClick={onClose} variant="default">
            Отмена
          </Button>
          <Button color={confirmColor} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
