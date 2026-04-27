import type { ReactElement } from 'react';
import { Stack, Text } from '@mantine/core';

import type { DepartureListItem } from '@/domain/queries/departure/departure-list.item.ts';
import {
  MiniRecordCard,
  PreviewMetricGrid,
  type RecordMetric,
} from '@/shared/ui/record-card';

import {
  DEPARTURE_MODE_LABELS,
  DEPARTURE_SUBJECT_KIND_LABELS,
  formatDepartureAmount,
  formatDepartureOccurredAt,
} from '../../lib/departures-page-formatters.ts';

export function buildDepartureMetrics(item: DepartureListItem): RecordMetric[] {
  return [
    {
      field: 'occurredAt',
      label: 'Дата',
      value: formatDepartureOccurredAt(item.occurredAt),
    },
    ...buildDepartureCardMetrics(item),
  ];
}

function buildDepartureCardMetrics(item: DepartureListItem): RecordMetric[] {
  return [
    {
      field: 'amount',
      label: 'Сумма',
      value: formatDepartureAmount(item.amount, item.currency),
    },
    {
      field: 'departureMode',
      label: 'Режим',
      value: DEPARTURE_MODE_LABELS[item.mode],
    },
    {
      field: 'codes',
      label: 'Коды',
      value: item.hasCodes ? 'есть' : 'нет',
    },
  ];
}

export function DepartureCard({
  item,
  onOpen,
}: Readonly<{
  item: DepartureListItem;
  onOpen: () => void;
}>): ReactElement {
  return (
    <MiniRecordCard
      badges={[
        {
          color: 'teal',
          label: DEPARTURE_SUBJECT_KIND_LABELS[item.subjectKind],
        },
        item.productName ? { color: 'indigo', label: item.productName } : null,
        item.supplierName ? { color: 'grape', label: item.supplierName } : null,
      ].filter((badge): badge is { color: string; label: string } =>
        Boolean(badge)
      )}
      description={item.description}
      metrics={buildDepartureCardMetrics(item)}
      onOpen={onOpen}
      openLabel={`Открыть расход ${item.title}`}
      primaryValue={formatDepartureAmount(item.amount, item.currency)}
      subtitle={formatDepartureOccurredAt(item.occurredAt)}
      title={item.title}
    />
  );
}

export function DeparturePreviewContent({
  item,
}: Readonly<{ item: DepartureListItem }>): ReactElement {
  return (
    <Stack gap="md">
      <PreviewMetricGrid metrics={buildDepartureMetrics(item)} />
      <Stack gap={4}>
        <Text fw={700} size="sm">
          Описание
        </Text>
        <Text c={item.description ? undefined : 'dimmed'} size="sm">
          {item.description || 'Описание не заполнено.'}
        </Text>
      </Stack>
      <PreviewMetricGrid
        metrics={[
          {
            field: 'subjectKind',
            label: 'Тип',
            value: DEPARTURE_SUBJECT_KIND_LABELS[item.subjectKind],
          },
          {
            field: 'direction',
            label: 'Направление',
            value: item.direction || '—',
          },
          {
            field: 'supplier',
            label: 'Поставщик',
            value: item.supplierName || '—',
          },
          { field: 'product', label: 'Товар', value: item.productName || '—' },
          {
            field: 'category',
            label: 'Категория',
            value: item.categoryName || '—',
          },
          { field: 'note', label: 'Заметка', value: item.note || '—' },
        ]}
      />
    </Stack>
  );
}
