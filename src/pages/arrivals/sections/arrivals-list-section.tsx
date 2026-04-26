import { type ReactElement, useState } from 'react';
import { Box, Button, Group, Stack, Text } from '@mantine/core';

import { useDeleteArrival } from '@/features/arrival-editor/hooks/use-delete-arrival.ts';
import { useAppNavigate } from '@/router';
import { useActionFeedback } from '@/shared/ui/action-feedback';
import { CollectionSection } from '@/shared/ui/collection-section';
import { ConfirmActionModal } from '@/shared/ui/confirm-action-modal';
import {
  PreviewActionButton,
  RecordPreviewDrawer,
} from '@/shared/ui/record-card';

import { ArrivalCard, ArrivalPreviewContent } from '../components/arrival-card';
import {
  ARRIVALS_SORT_OPTIONS,
  formatArrivalOccurredAt,
} from '../lib/arrivals-page-formatters.ts';
import { useArrivalsPageState } from '../lib/use-arrivals-page-state.ts';

export function ArrivalsListSection(): ReactElement {
  const navigate = useAppNavigate();
  const actionFeedback = useActionFeedback();
  const deleteArrival = useDeleteArrival();
  const [selectedArrivalId, setSelectedArrivalId] = useState<string | null>(
    null
  );
  const [deleteArrivalId, setDeleteArrivalId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    arrivals,
    filterMenu,
    searchValue,
    setSearchValue,
    sortValue,
    setSortValue,
  } = useArrivalsPageState();
  const selectedArrival =
    selectedArrivalId === null
      ? null
      : (arrivals.find((item) => item.id === selectedArrivalId) ?? null);
  const deleteTarget =
    deleteArrivalId === null
      ? null
      : (arrivals.find((item) => item.id === deleteArrivalId) ?? null);

  async function confirmDelete(): Promise<void> {
    if (deleteArrivalId === null) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteArrival.execute({ id: deleteArrivalId });

      if (result.ok) {
        setDeleteArrivalId(null);
        setSelectedArrivalId(null);
        actionFeedback.notify({
          kind: 'confirm',
          message: 'Приход удалён.',
          title: 'Приход',
        });
        return;
      }

      const message =
        result.code === 'ARRIVAL_HAS_DEPENDENT_DEPARTURES'
          ? `Нельзя удалить: есть связанные расходы (${result.departureCount}).`
          : 'Не удалось удалить приход. Проверьте запись и повторите действие.';
      setDeleteError(message);
      actionFeedback.notify({
        kind: 'error',
        message,
        title: 'Приход',
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
            <Text fw={600}>Приходов по текущим условиям нет</Text>
            <Text c="dimmed" size="sm" ta="center">
              Измените поиск или фильтры, либо создайте новую запись.
            </Text>
          </Stack>
        }
        filterMenu={filterMenu}
        footer={() => (
          <Stack gap="xs">
            <Text c="dimmed" size="xs">
              Найдено записей: {arrivals.length}
            </Text>
            <Group justify="flex-end" wrap="wrap">
              <Button onClick={() => navigate.to('root.arrivals.create')}>
                Создать
              </Button>
            </Group>
          </Stack>
        )}
        getItemId={(item) => item.id}
        items={arrivals}
        listLabel="Список приходов"
        onSearchChange={setSearchValue}
        onSortChange={setSortValue}
        renderItem={(item) => (
          <ArrivalCard
            item={item}
            onOpen={() => setSelectedArrivalId(item.id)}
          />
        )}
        searchPlaceholder="Поиск по названию, поставщику или категории"
        searchValue={searchValue}
        sortOptions={ARRIVALS_SORT_OPTIONS}
        sortValue={sortValue}
      />
      <RecordPreviewDrawer
        actions={
          selectedArrival ? (
            <>
              <PreviewActionButton
                onClick={() =>
                  navigate.to('root.arrivals.edit', {
                    params: { arrivalId: selectedArrival.id },
                  })
                }
              >
                Редактировать
              </PreviewActionButton>
              <PreviewActionButton
                color="red"
                onClick={() => setDeleteArrivalId(selectedArrival.id)}
                variant="light"
              >
                Удалить
              </PreviewActionButton>
              <PreviewActionButton
                onClick={() =>
                  navigate.to('root.arrivals.details', {
                    params: { arrivalId: selectedArrival.id },
                  })
                }
                variant="filled"
              >
                Детали
              </PreviewActionButton>
            </>
          ) : null
        }
        onClose={() => setSelectedArrivalId(null)}
        opened={selectedArrival !== null}
        subtitle={
          selectedArrival
            ? formatArrivalOccurredAt(selectedArrival.occurredAt)
            : ''
        }
        title={selectedArrival?.title ?? 'Карточка прихода'}
      >
        {selectedArrival ? (
          <ArrivalPreviewContent item={selectedArrival} />
        ) : null}
      </RecordPreviewDrawer>
      <ConfirmActionModal
        confirmLabel="Удалить"
        description={
          deleteError ??
          `Удалить приход "${deleteTarget?.title ?? ''}"? Связанные коды этой записи будут удалены вместе с ней.`
        }
        loading={isDeleting}
        onClose={() => {
          setDeleteArrivalId(null);
          setDeleteError(null);
        }}
        onConfirm={() => void confirmDelete()}
        opened={deleteTarget !== null}
        title="Удаление прихода"
      />
    </Box>
  );
}
