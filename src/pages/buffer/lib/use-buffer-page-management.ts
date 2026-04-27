import { useEffect, useState } from 'react';

import {
  bufferControlController,
  type BufferControlOwner,
  type BufferItem,
  bufferStore,
} from '@/features/buffer/core/buffer-core.public.ts';
import { useActionFeedback } from '@/shared/ui/action-feedback';

const BUFFER_PAGE_OWNER: BufferControlOwner = {
  kind: 'buffer-page',
};

interface BufferPageManagementInput {
  items: BufferItem[];
  selectedIds: readonly string[];
  setSelectedIds: (selectedIds: readonly string[]) => void;
}

export function useBufferPageManagement({
  items,
  selectedIds,
  setSelectedIds,
}: BufferPageManagementInput) {
  const actionFeedback = useActionFeedback();
  const [manageLeaseConflict, setManageLeaseConflict] = useState<string | null>(
    null
  );
  const [isDeleteSelectedConfirmOpen, setIsDeleteSelectedConfirmOpen] =
    useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingError, setEditingError] = useState<string | null>(null);

  useEffect(() => {
    const result = bufferControlController.acquireControl({
      owner: BUFFER_PAGE_OWNER,
      mode: 'manage',
    });

    queueMicrotask(() => {
      if (result.code === 'lease-conflict') {
        setManageLeaseConflict(
          `Буфер уже контролирует другой владелец: ${result.currentLease.owner.kind}.`
        );
        return;
      }

      setManageLeaseConflict(null);
    });

    if (result.code === 'lease-conflict') {
      return;
    }

    return () => {
      bufferControlController.releaseControl({
        owner: BUFFER_PAGE_OWNER,
      });
    };
  }, []);

  const editingItem =
    editingItemId === null
      ? null
      : (items.find((item) => item.id === editingItemId) ?? null);
  const canManage = manageLeaseConflict === null;

  function confirmDeleteSelected(): void {
    const deletedCount = selectedIds.length;
    bufferStore.getState().deleteItems([...selectedIds]);
    setSelectedIds([]);
    setIsDeleteSelectedConfirmOpen(false);
    actionFeedback.notify({
      kind: 'confirm',
      message: `Удалено элементов: ${deletedCount}.`,
      title: 'Буфер',
    });
  }

  function confirmClear(): void {
    bufferStore.getState().clear();
    setSelectedIds([]);
    setIsClearConfirmOpen(false);
    actionFeedback.notify({
      kind: 'confirm',
      message: 'Буфер очищен.',
      title: 'Буфер',
    });
  }

  function openEditor(itemId: string): void {
    const item = items.find((entry) => entry.id === itemId);

    if (item === undefined) {
      return;
    }

    setEditingItemId(item.id);
    setEditingValue(item.value);
    setEditingError(null);
  }

  function closeEditor(): void {
    setEditingItemId(null);
    setEditingValue('');
    setEditingError(null);
  }

  function handleSaveEdit(): void {
    if (editingItemId === null) {
      return;
    }

    const result = bufferStore.getState().updateItem({
      id: editingItemId,
      value: editingValue,
    });

    switch (result.code) {
      case 'updated':
        closeEditor();
        actionFeedback.notify({
          kind: 'success',
          message: 'Элемент буфера обновлен.',
          title: 'Буфер',
        });
        return;
      case 'duplicate':
        setEditingError('Такой номер уже есть в буфере.');
        actionFeedback.notify({
          kind: 'warning',
          message: 'Такой номер уже есть в буфере.',
          title: 'Буфер',
        });
        return;
      case 'empty-value':
        setEditingError('Номер не может быть пустым.');
        actionFeedback.notify({
          kind: 'warning',
          message: 'Номер не может быть пустым.',
          title: 'Буфер',
        });
        return;
      case 'not-found':
      default:
        setEditingError('Элемент не найден.');
        actionFeedback.notify({
          kind: 'error',
          message: 'Элемент не найден.',
          title: 'Буфер',
        });
    }
  }

  return {
    canManage,
    closeEditor,
    confirmClear,
    confirmDeleteSelected,
    editingError,
    editingItem,
    editingItemId,
    editingValue,
    handleSaveEdit,
    isClearConfirmOpen,
    isDeleteSelectedConfirmOpen,
    manageLeaseConflict,
    openEditor,
    setEditingError,
    setEditingValue,
    setIsClearConfirmOpen,
    setIsDeleteSelectedConfirmOpen,
  };
}

export type BufferPageManagementState = ReturnType<
  typeof useBufferPageManagement
>;
