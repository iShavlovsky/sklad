import type { ReactElement } from 'react';
import { Alert, Button, Stack, Text, TextInput } from '@mantine/core';

import {
  PreviewMetricGrid,
  type RecordMetric,
  RecordPreviewDrawer,
} from '@/shared/ui/record-card';

import {
  formatBufferCapturedAt,
  formatBufferKind,
  formatBufferSource,
} from '../lib/buffer-page-formatters.ts';
import type { BufferPageState } from '../lib/use-buffer-page-state.ts';

interface BufferEditDialogProps {
  state: BufferPageState;
}

function buildBufferPreviewMetrics(
  item: NonNullable<BufferPageState['editingItem']>
): RecordMetric[] {
  return [
    {
      field: 'occurredAt',
      label: 'Дата',
      value: formatBufferCapturedAt(item.capturedAt),
    },
    {
      field: 'source',
      label: 'Источник',
      value: formatBufferSource(item.source),
    },
    {
      field: 'kind',
      label: 'Тип',
      value: formatBufferKind(item.kind),
    },
    {
      field: 'codes',
      label: 'Значение',
      value: item.value,
    },
  ];
}

export function BufferEditDialog({
  state,
}: Readonly<BufferEditDialogProps>): ReactElement {
  const opened = state.editingItemId !== null;
  const isMissing = state.editingItemId !== null && state.editingItem === null;

  return (
    <RecordPreviewDrawer
      actions={
        state.editingItem ? (
          <>
            <Button onClick={state.closeEditor} size="sm" variant="default">
              Закрыть
            </Button>
            <Button
              disabled={state.editingValue.trim() === state.editingItem.value}
              onClick={state.handleSaveEdit}
              size="sm"
            >
              Сохранить
            </Button>
          </>
        ) : (
          <Button onClick={state.closeEditor} size="sm" variant="default">
            Закрыть
          </Button>
        )
      }
      onClose={state.closeEditor}
      opened={opened}
      title="Карточка кода"
    >
      <Stack gap="md">
        {(state.editingError ?? isMissing) ? (
          <Alert color="red" title="Данные" variant="light">
            {state.editingError ?? 'Элемент уже недоступен.'}
          </Alert>
        ) : null}

        {state.editingItem ? (
          <>
            <PreviewMetricGrid
              metrics={buildBufferPreviewMetrics(state.editingItem)}
            />

            <Stack gap={4}>
              <Text fw={700} size="sm">
                Номер
              </Text>
              <Text style={{ overflowWrap: 'anywhere' }} size="sm">
                {state.editingItem.value}
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text c="dimmed" size="sm">
                Измените номер и сохраните обновление.
              </Text>

              <TextInput
                label="Номер"
                onChange={(event) => {
                  state.setEditingValue(event.currentTarget.value);
                  if (state.editingError !== null) {
                    state.setEditingError(null);
                  }
                }}
                styles={{
                  input: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
                value={state.editingValue}
              />
            </Stack>
          </>
        ) : null}
      </Stack>
    </RecordPreviewDrawer>
  );
}
