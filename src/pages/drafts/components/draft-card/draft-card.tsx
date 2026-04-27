import type { ReactElement } from 'react';
import { Stack, Text } from '@mantine/core';

import type { DraftListItem } from '@/domain/queries/draft/draft-list.item.ts';
import {
  MiniRecordCard,
  PreviewMetricGrid,
  type RecordMetric,
} from '@/shared/ui/record-card';

import {
  DRAFT_KIND_LABELS,
  DRAFT_SUBJECT_KIND_LABELS,
  formatDraftDate,
} from '../../lib/drafts-page-formatters.ts';

export function buildDraftMetrics(item: DraftListItem): RecordMetric[] {
  return [
    {
      field: 'updatedAt',
      label: 'Обновлён',
      value: formatDraftDate(item.updatedAt),
    },
    ...buildDraftCardMetrics(item),
  ];
}

function buildDraftCardMetrics(item: DraftListItem): RecordMetric[] {
  return [
    {
      field: 'draftKind',
      label: 'Сценарий',
      value: DRAFT_KIND_LABELS[item.kind],
    },
    {
      field: 'subjectKind',
      label: 'Тип',
      value: DRAFT_SUBJECT_KIND_LABELS[item.payloadSummary.subjectKind],
    },
    {
      field: 'codes',
      label: 'Коды',
      value: item.hasCodes ? 'есть' : 'нет',
    },
  ];
}

export function DraftCard({
  item,
  onOpen,
}: Readonly<{
  item: DraftListItem;
  onOpen: () => void;
}>): ReactElement {
  return (
    <MiniRecordCard
      badges={[
        {
          color: item.kind === 'arrival' ? 'blue' : 'orange',
          label: DRAFT_KIND_LABELS[item.kind],
        },
        {
          color: 'teal',
          label: DRAFT_SUBJECT_KIND_LABELS[item.payloadSummary.subjectKind],
        },
      ]}
      description={item.payloadSummary.note}
      metrics={buildDraftCardMetrics(item)}
      onOpen={onOpen}
      openLabel={`Открыть черновик ${item.title}`}
      subtitle={`Обновлён ${formatDraftDate(item.updatedAt)}`}
      title={item.title}
    />
  );
}

export function DraftPreviewContent({
  item,
}: Readonly<{ item: DraftListItem }>): ReactElement {
  return (
    <Stack gap="md">
      <PreviewMetricGrid metrics={buildDraftMetrics(item)} />
      <Stack gap={4}>
        <Text fw={700} size="sm">
          Рабочая заметка
        </Text>
        <Text c={item.payloadSummary.note ? undefined : 'dimmed'} size="sm">
          {item.payloadSummary.note || 'Заметка не заполнена.'}
        </Text>
      </Stack>
      <PreviewMetricGrid
        metrics={[
          {
            field: 'occurredAt',
            label: 'Дата события',
            value: item.payloadSummary.occurredAt
              ? formatDraftDate(item.payloadSummary.occurredAt)
              : '—',
          },
          {
            field: 'updatedAt',
            label: 'Создан',
            value: formatDraftDate(item.createdAt),
          },
          {
            field: 'linkUrl',
            label: 'Ссылка',
            value:
              item.payloadSummary.kind === 'arrival'
                ? item.payloadSummary.linkUrl || '—'
                : '—',
          },
          {
            field: 'direction',
            label: 'Направление',
            value:
              item.payloadSummary.kind === 'departure'
                ? item.payloadSummary.direction || '—'
                : '—',
          },
        ]}
      />
    </Stack>
  );
}
