import { type ReactElement, useState } from 'react';
import { Box, Button, Group, Stack, Text } from '@mantine/core';

import { useDeleteDeparture } from '@/features/departure-editor/hooks/use-delete-departure.ts';
import { useAppNavigate } from '@/router';
import { useActionFeedback } from '@/shared/ui/action-feedback';
import { CollectionSection } from '@/shared/ui/collection-section';
import { ConfirmActionModal } from '@/shared/ui/confirm-action-modal';
import {
  PreviewActionButton,
  RecordPreviewDrawer,
} from '@/shared/ui/record-card';

import {
  DepartureCard,
  DeparturePreviewContent,
} from '../components/departure-card';
import {
  DEPARTURES_SORT_OPTIONS,
  formatDepartureOccurredAt,
} from '../lib/departures-page-formatters.ts';
import { useDeparturesPageState } from '../lib/use-departures-page-state.ts';

export function DeparturesListSection(): ReactElement {
  const navigate = useAppNavigate();
  const actionFeedback = useActionFeedback();
  const deleteDeparture = useDeleteDeparture();
  const [selectedDepartureId, setSelectedDepartureId] = useState<string | null>(
    null
  );
  const [deleteDepartureId, setDeleteDepartureId] = useState<string | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    departures,
    filterMenu,
    searchValue,
    setSearchValue,
    sortValue,
    setSortValue,
  } = useDeparturesPageState();
  const selectedDeparture =
    selectedDepartureId === null
      ? null
      : (departures.find((item) => item.id === selectedDepartureId) ?? null);
  const deleteTarget =
    deleteDepartureId === null
      ? null
      : (departures.find((item) => item.id === deleteDepartureId) ?? null);

  async function confirmDelete(): Promise<void> {
    if (deleteDepartureId === null) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteDeparture.execute({ id: deleteDepartureId });

      if (result.ok) {
        setDeleteDepartureId(null);
        setSelectedDepartureId(null);
        actionFeedback.notify({
          kind: 'confirm',
          message: 'Расход удалён.',
          title: 'Расход',
        });
        return;
      }

      const message =
        'Не удалось удалить расход. Проверьте запись и повторите действие.';
      setDeleteError(message);
      actionFeedback.notify({
        kind: 'error',
        message,
        title: 'Расход',
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
            <Text fw={600}>Расходов по текущим условиям нет</Text>
            <Text c="dimmed" size="sm" ta="center">
              Попробуйте снять фильтры или создайте новую расходную запись.
            </Text>
          </Stack>
        }
        filterMenu={filterMenu}
        footer={() => (
          <Stack gap="xs">
            <Text c="dimmed" size="xs">
              Найдено записей: {departures.length}
            </Text>
            <Group justify="flex-end" wrap="wrap">
              <Button
                data-testid="departures-create-button"
                onClick={() => navigate.to('root.departures.create')}
              >
                Создать
              </Button>
            </Group>
          </Stack>
        )}
        getItemId={(item) => item.id}
        items={departures}
        listLabel="Список расходов"
        onSearchChange={setSearchValue}
        onSortChange={setSortValue}
        renderItem={(item) => (
          <DepartureCard
            item={item}
            onOpen={() => setSelectedDepartureId(item.id)}
          />
        )}
        searchPlaceholder="Поиск по названию, поставщику или категории"
        searchValue={searchValue}
        sortOptions={DEPARTURES_SORT_OPTIONS}
        sortValue={sortValue}
      />
      <RecordPreviewDrawer
        actions={
          selectedDeparture ? (
            <>
              <PreviewActionButton
                onClick={() =>
                  navigate.to('root.departures.edit', {
                    params: { departureId: selectedDeparture.id },
                  })
                }
              >
                Редактировать
              </PreviewActionButton>
              <PreviewActionButton
                color="red"
                onClick={() => setDeleteDepartureId(selectedDeparture.id)}
                variant="light"
              >
                Удалить
              </PreviewActionButton>
              <PreviewActionButton
                onClick={() =>
                  navigate.to('root.departures.details', {
                    params: { departureId: selectedDeparture.id },
                  })
                }
                variant="filled"
              >
                Детали
              </PreviewActionButton>
            </>
          ) : null
        }
        onClose={() => setSelectedDepartureId(null)}
        opened={selectedDeparture !== null}
        subtitle={
          selectedDeparture
            ? formatDepartureOccurredAt(selectedDeparture.occurredAt)
            : ''
        }
        title={selectedDeparture?.title ?? 'Карточка расхода'}
      >
        {selectedDeparture ? (
          <DeparturePreviewContent item={selectedDeparture} />
        ) : null}
      </RecordPreviewDrawer>
      <ConfirmActionModal
        confirmLabel="Удалить"
        description={
          deleteError ??
          `Удалить расход "${deleteTarget?.title ?? ''}"? Связанные коды этой записи будут удалены вместе с ней.`
        }
        loading={isDeleting}
        onClose={() => {
          setDeleteDepartureId(null);
          setDeleteError(null);
        }}
        onConfirm={() => void confirmDelete()}
        opened={deleteTarget !== null}
        title="Удаление расхода"
      />
    </Box>
  );
}
