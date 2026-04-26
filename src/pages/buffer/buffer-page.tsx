import type { ReactElement } from 'react';
import { Stack } from '@mantine/core';

import { BottomSpacer, PageContainer } from '@/shared/ui/page-primitives';

import { BufferClearDialog } from './dialogs/buffer-clear-dialog.tsx';
import { BufferDeleteSelectedDialog } from './dialogs/buffer-delete-selected-dialog.tsx';
import { BufferEditDialog } from './dialogs/buffer-edit-dialog.tsx';
import { useBufferPageState } from './lib/use-buffer-page-state.ts';
import { BufferActionsSection } from './sections/buffer-actions-section.tsx';
import { BufferListSection } from './sections/buffer-list-section.tsx';
import { BufferToolbarSection } from './sections/buffer-toolbar-section.tsx';

export function BufferPage(): ReactElement {
  const state = useBufferPageState();

  return (
    <PageContainer scrollable={false}>
      <Stack
        className="mobile-page-sections"
        gap="var(--sl-page-section-gap)"
        style={{ flex: '1 1 auto', minHeight: 0 }}
      >
        <BufferToolbarSection manageLeaseConflict={state.manageLeaseConflict} />
        <BufferListSection state={state} />
        <BufferActionsSection
          canManage={state.canManage}
          itemCount={state.items.length}
          onClear={() => state.setIsClearConfirmOpen(true)}
          onDeleteSelected={() => state.setIsDeleteSelectedConfirmOpen(true)}
          selectedCount={state.selectedIds.length}
        />
      </Stack>

      <BottomSpacer />

      <BufferEditDialog state={state} />
      <BufferDeleteSelectedDialog
        onClose={() => state.setIsDeleteSelectedConfirmOpen(false)}
        onConfirm={state.confirmDeleteSelected}
        opened={state.isDeleteSelectedConfirmOpen}
        selectedCount={state.selectedIds.length}
      />
      <BufferClearDialog
        onClose={() => state.setIsClearConfirmOpen(false)}
        onConfirm={state.confirmClear}
        opened={state.isClearConfirmOpen}
      />
    </PageContainer>
  );
}
