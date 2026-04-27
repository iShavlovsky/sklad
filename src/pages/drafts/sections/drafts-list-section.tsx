import { type ReactElement, useState } from 'react';
import { Box, Button, Group, Stack, Text } from '@mantine/core';

import { useDeleteDraft } from '@/features/drafts/data/hooks/use-delete-draft.ts';
import { useAppNavigate } from '@/router';
import { useActionFeedback } from '@/shared/ui/action-feedback';
import { CollectionSection } from '@/shared/ui/collection-section';
import { ConfirmActionModal } from '@/shared/ui/confirm-action-modal';
import {
  PreviewActionButton,
  RecordPreviewDrawer,
} from '@/shared/ui/record-card';

import {
  DraftCard,
  DraftPreviewContent,
} from '../components/draft-card/draft-card';
import {
  DRAFTS_SORT_OPTIONS,
  formatDraftDate,
} from '../lib/drafts-page-formatters.ts';
import { useDraftsPageState } from '../lib/use-drafts-page-state.ts';

export function DraftsListSection(): ReactElement {
  const navigate = useAppNavigate();
  const actionFeedback = useActionFeedback();
  const deleteDraft = useDeleteDraft();
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [deleteDraftId, setDeleteDraftId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    drafts,
    filterMenu,
    searchValue,
    setSearchValue,
    sortValue,
    setSortValue,
  } = useDraftsPageState();
  const selectedDraft =
    selectedDraftId === null
      ? null
      : (drafts.find((item) => item.id === selectedDraftId) ?? null);
  const deleteTarget =
    deleteDraftId === null
      ? null
      : (drafts.find((item) => item.id === deleteDraftId) ?? null);

  async function confirmDelete(): Promise<void> {
    if (deleteDraftId === null) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteDraft.execute({ id: deleteDraftId });

      if (result.ok) {
        setDeleteDraftId(null);
        setSelectedDraftId(null);
        actionFeedback.notify({
          kind: 'confirm',
          message: 'Черновик удалён.',
          title: 'Черновик',
        });
        return;
      }

      const message =
        'Не удалось удалить черновик. Проверьте запись и повторите действие.';
      setDeleteError(message);
      actionFeedback.notify({
        kind: 'error',
        message,
        title: 'Черновик',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Box
      className="page-section"
      style={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}
    >
      <CollectionSection
        emptyState={
          <Stack align="center" gap="xs">
            <Text fw={600}>Черновиков по текущим условиям нет</Text>
            <Text c="dimmed" size="sm" ta="center">
              Измените поиск или фильтры, либо создайте новый черновик.
            </Text>
          </Stack>
        }
        filterMenu={filterMenu}
        footer={() => (
          <Stack gap="xs">
            <Text c="dimmed" size="xs">
              Найдено черновиков: {drafts.length}
            </Text>
            <Group justify="flex-end" wrap="wrap">
              <Button
                data-testid="drafts-create-button"
                onClick={() => navigate.to('root.drafts.create')}
              >
                Создать
              </Button>
            </Group>
          </Stack>
        )}
        getItemId={(item) => item.id}
        items={drafts}
        listLabel="Список черновиков"
        onSearchChange={setSearchValue}
        onSortChange={setSortValue}
        renderItem={(item) => (
          <DraftCard item={item} onOpen={() => setSelectedDraftId(item.id)} />
        )}
        searchPlaceholder="Поиск по названию черновика"
        searchValue={searchValue}
        sortOptions={DRAFTS_SORT_OPTIONS}
        sortValue={sortValue}
      />
      <RecordPreviewDrawer
        actions={
          selectedDraft ? (
            <>
              <PreviewActionButton
                onClick={() =>
                  navigate.to('root.drafts.edit', {
                    params: { draftId: selectedDraft.id },
                  })
                }
              >
                Редактировать
              </PreviewActionButton>
              <PreviewActionButton
                color="red"
                onClick={() => setDeleteDraftId(selectedDraft.id)}
                variant="light"
              >
                Удалить
              </PreviewActionButton>
              <PreviewActionButton
                onClick={() =>
                  navigate.to('root.drafts.details', {
                    params: { draftId: selectedDraft.id },
                  })
                }
                variant="filled"
              >
                Детали
              </PreviewActionButton>
            </>
          ) : null
        }
        onClose={() => setSelectedDraftId(null)}
        opened={selectedDraft !== null}
        subtitle={
          selectedDraft
            ? `Обновлен ${formatDraftDate(selectedDraft.updatedAt)}`
            : ''
        }
        title={selectedDraft?.title ?? 'Карточка черновика'}
      >
        {selectedDraft ? <DraftPreviewContent item={selectedDraft} /> : null}
      </RecordPreviewDrawer>
      <ConfirmActionModal
        confirmLabel="Удалить"
        description={
          deleteError ??
          `Удалить черновик "${deleteTarget?.title ?? ''}"? Его рабочие коды будут удалены вместе с ним.`
        }
        loading={isDeleting}
        onClose={() => {
          setDeleteDraftId(null);
          setDeleteError(null);
        }}
        onConfirm={() => void confirmDelete()}
        opened={deleteTarget !== null}
        title="Удаление черновика"
      />
    </Box>
  );
}
