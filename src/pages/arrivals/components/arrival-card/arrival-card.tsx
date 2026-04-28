import type { ReactElement } from 'react';
import { Stack, Text } from '@mantine/core';

import type { ArrivalListItem } from '@/domain/queries/arrival/arrival-list.item.ts';
import {
  MiniRecordCard,
  PreviewMetricGrid,
  type RecordMetric,
} from '@/shared/ui/record-card';

import {
  ARRIVAL_SUBJECT_KIND_LABELS,
  formatArrivalAmount,
  formatArrivalOccurredAt,
} from '../../lib/arrivals-page-formatters.ts';

export function buildArrivalMetrics(item: ArrivalListItem): RecordMetric[] {
  return [
    {
      field: 'occurredAt',
      label: 'Дата',
      value: formatArrivalOccurredAt(item.occurredAt),
    },
    ...buildArrivalCardMetrics(item),
  ];
}

function buildArrivalCardMetrics(item: ArrivalListItem): RecordMetric[] {
  return [
    {
      field: 'amount',
      label: 'Сумма',
      value: formatArrivalAmount(
        item.amount,
        item.currency,
        item.quantity,
        item.totalCost,
        item.unitCost
      ),
    },
    {
      field: 'subjectKind',
      label: 'Тип',
      value: ARRIVAL_SUBJECT_KIND_LABELS[item.subjectKind],
    },
    {
      field: 'codes',
      label: 'Коды',
      value: item.hasCodes ? 'есть' : 'нет',
    },
  ];
}

export function ArrivalCard({
  item,
  onOpen,
}: Readonly<{
  item: ArrivalListItem;
  onOpen: () => void;
}>): ReactElement {
  return (
    <MiniRecordCard
      badges={[
        item.productName ? { color: 'indigo', label: item.productName } : null,
        item.supplierName ? { color: 'grape', label: item.supplierName } : null,
        item.categoryName ? { color: 'gray', label: item.categoryName } : null,
      ].filter((badge): badge is { color: string; label: string } =>
        Boolean(badge)
      )}
      description={item.description}
      metrics={buildArrivalCardMetrics(item)}
      onOpen={onOpen}
      openLabel={`Открыть приход ${item.title}`}
      primaryValue={formatArrivalAmount(
        item.amount,
        item.currency,
        item.quantity,
        item.totalCost,
        item.unitCost
      )}
      subtitle={formatArrivalOccurredAt(item.occurredAt)}
      title={item.title}
    />
  );
}

export function ArrivalPreviewContent({
  item,
}: Readonly<{ item: ArrivalListItem }>): ReactElement {
  return (
    <Stack gap="md">
      <PreviewMetricGrid metrics={buildArrivalMetrics(item)} />
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
