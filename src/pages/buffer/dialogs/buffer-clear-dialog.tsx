import type { ReactElement } from 'react';

import { ConfirmActionModal } from '@/shared/ui/confirm-action-modal';

interface BufferClearDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  opened: boolean;
}

export function BufferClearDialog({
  onClose,
  onConfirm,
  opened,
}: Readonly<BufferClearDialogProps>): ReactElement {
  return (
    <ConfirmActionModal
      confirmLabel="Очистить буфер"
      description="Все сохранённые элементы буфера будут удалены."
      onClose={onClose}
      onConfirm={onConfirm}
      opened={opened}
      title="Очистить буфер"
    />
  );
}
