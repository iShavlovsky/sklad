import { useStore } from 'zustand';

import { bufferStore } from '@/features/buffer/core/buffer-core.public.ts';

import { useBufferPageManagement } from './use-buffer-page-management.ts';
import { useBufferPageViewState } from './use-buffer-page-view-state.ts';

export function useBufferPageState() {
  const items = useStore(bufferStore, (state) => state.items);
  const viewState = useBufferPageViewState(items);
  const managementState = useBufferPageManagement({
    items,
    selectedIds: viewState.selectedIds,
    setSelectedIds: viewState.setSelectedIds,
  });

  return {
    ...viewState,
    ...managementState,
    items,
  };
}

export type BufferPageState = ReturnType<typeof useBufferPageState>;
