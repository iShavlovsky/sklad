import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';

import { bufferControlController } from '@/features/buffer-core/model/buffer-control.controller.instance.ts';
import type { BufferControlOwner } from '@/features/buffer-core/model/buffer-control.types.ts';
import { bufferStore } from '@/features/buffer-core/model/buffer-store.ts';
import { useActionFeedback } from '@/shared/ui/action-feedback';
import type { CollectionFilterMenuConfig } from '@/shared/ui/collection-section/types.ts';

import {
  BUFFER_PAGE_SORT_OPTIONS,
  formatBufferKind,
  formatBufferSource,
} from './buffer-page-formatters.ts';
import {
  type BufferPageSortKey,
  filterAndSortBufferItems,
} from './buffer-page-mappers.ts';

const BUFFER_PAGE_OWNER: BufferControlOwner = {
  kind: 'buffer-page',
};

export function useBufferPageState() {
  const actionFeedback = useActionFeedback();
  const items = useStore(bufferStore, (state) => state.items);
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState<string | null>('capturedAt-desc');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
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

  const visibleItems = useMemo(
    () =>
      filterAndSortBufferItems(items, {
        kind: kindFilter,
        reversed: sortValue !== null && !sortValue.endsWith('-asc'),
        search: searchValue,
        sortBy: (sortValue?.split('-')[0] ?? 'capturedAt') as BufferPageSortKey,
        source: sourceFilter,
      }),
    [items, kindFilter, searchValue, sortValue, sourceFilter]
  );

  const editingItem =
    editingItemId === null
      ? null
      : (items.find((item) => item.id === editingItemId) ?? null);
  const canManage = manageLeaseConflict === null;

  const sourceOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.source?.trim()).filter(Boolean))
      ) as string[],
    [items]
  );
  const kindOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.kind?.trim()).filter(Boolean))
      ) as string[],
    [items]
  );

  const filterMenu = useMemo<CollectionFilterMenuConfig>(
    () => ({
      triggerLabel: 'Фильтры',
      groups: [
        {
          key: 'source',
          label: 'Источник',
          items: [
            {
              checked: sourceFilter === null,
              closeMenuOnClick: false,
              key: 'source-all',
              label: 'Все источники',
              onClick: () => setSourceFilter(null),
            },
            ...sourceOptions.map((value) => ({
              checked: sourceFilter === value,
              closeMenuOnClick: false,
              key: `source-${value}`,
              label: formatBufferSource(value),
              onClick: () => setSourceFilter(value),
            })),
          ],
        },
        {
          key: 'kind',
          label: 'Тип кода',
          items: [
            {
              checked: kindFilter === null,
              closeMenuOnClick: false,
              key: 'kind-all',
              label: 'Все типы',
              onClick: () => setKindFilter(null),
            },
            ...kindOptions.map((value) => ({
              checked: kindFilter === value,
              closeMenuOnClick: false,
              key: `kind-${value}`,
              label: formatBufferKind(value),
              onClick: () => setKindFilter(value),
            })),
          ],
        },
      ],
    }),
    [kindFilter, kindOptions, sourceFilter, sourceOptions]
  );

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
    BUFFER_PAGE_SORT_OPTIONS,
    canManage,
    closeEditor,
    confirmClear,
    confirmDeleteSelected,
    editingError,
    editingItem,
    editingItemId,
    editingValue,
    filterMenu,
    handleSaveEdit,
    isClearConfirmOpen,
    isDeleteSelectedConfirmOpen,
    items,
    manageLeaseConflict,
    openEditor,
    searchValue,
    selectedIds,
    setEditingError,
    setEditingValue,
    setIsClearConfirmOpen,
    setIsDeleteSelectedConfirmOpen,
    setSearchValue,
    setSelectedIds,
    setSortValue,
    sortValue,
    visibleItems,
  };
}

export type BufferPageState = ReturnType<typeof useBufferPageState>;
