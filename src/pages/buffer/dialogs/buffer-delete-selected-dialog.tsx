import type { ReactElement } from 'react';

import { ConfirmActionModal } from '@/shared/ui/confirm-action-modal';

interface BufferDeleteSelectedDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  opened: boolean;
  selectedCount: number;
}

export function BufferDeleteSelectedDialog({
  onClose,
  onConfirm,
  opened,
  selectedCount,
}: Readonly<BufferDeleteSelectedDialogProps>): ReactElement {
  return (
    <ConfirmActionModal
      confirmLabel="Удалить выбранное"
      description={`Будет удалено ${selectedCount} выбранных элементов.`}
      onClose={onClose}
      onConfirm={onConfirm}
      opened={opened}
      title="Удалить выбранные записи"
    />
  );
}
