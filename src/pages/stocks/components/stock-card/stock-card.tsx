import type { ReactElement } from 'react';
import { Progress, Stack, Text } from '@mantine/core';

import type { StockListItem } from '@/domain/queries/stock/stock-list.item.ts';
import {
  MiniRecordCard,
  PreviewMetricGrid,
  type RecordMetric,
} from '@/shared/ui/record-card';

import {
  formatStockDate,
  STOCK_SUBJECT_KIND_LABELS,
} from '../../lib/stocks-page-formatters.ts';

export function buildStockMetrics(item: StockListItem): RecordMetric[] {
  return [
    { field: 'balance', label: 'Остаток', value: `${item.balance} шт.` },
    {
      field: 'codes',
      label: 'Доступно кодов',
      value: item.availableCodes.length,
    },
    { field: 'source', label: 'Приходов', value: item.arrivalCount },
    { field: 'departureMode', label: 'Отгрузок', value: item.departureCount },
  ];
}

export function StockCard({
  item,
  onOpen,
}: Readonly<{
  item: StockListItem;
  onOpen: () => void;
}>): ReactElement {
  const totalFlow = Math.max(item.arrivalCount + item.departureCount, 1);
  const balanceRatio = Math.min(
    Math.max((item.balance / totalFlow) * 100, 0),
    100
  );

  return (
    <MiniRecordCard
      badges={[
        { color: 'blue', label: STOCK_SUBJECT_KIND_LABELS[item.subjectKind] },
        item.productName ? { color: 'indigo', label: item.productName } : null,
        item.supplierName ? { color: 'grape', label: item.supplierName } : null,
      ].filter((badge): badge is { color: string; label: string } =>
        Boolean(badge)
      )}
      description={
        <Stack gap={4}>
          <Progress
            aria-label={`Доля остатка ${item.title}`}
            color={item.balance > 0 ? 'green' : 'gray'}
            radius="xl"
            size="xs"
            value={balanceRatio}
          />
          <Text c="dimmed" size="xs">
            {item.balance > 0 ? 'Есть доступный остаток' : 'Остатка нет'}
          </Text>
        </Stack>
      }
      metrics={buildStockMetrics(item)}
      onOpen={onOpen}
      openLabel={`Открыть остаток ${item.title}`}
      primaryValue={`${item.balance} шт.`}
      subtitle={`Обновлено ${formatStockDate(item.updatedAt)}`}
      title={item.title}
    />
  );
}

export function StockPreviewContent({
  item,
}: Readonly<{ item: StockListItem }>): ReactElement {
  return (
    <Stack gap="md">
      <PreviewMetricGrid metrics={buildStockMetrics(item)} />
      <PreviewMetricGrid
        metrics={[
          {
            field: 'updatedAt',
            label: 'Обновлено',
            value: formatStockDate(item.updatedAt),
          },
          {
            field: 'subjectKind',
            label: 'Тип',
            value: STOCK_SUBJECT_KIND_LABELS[item.subjectKind],
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
        ]}
      />
      <Stack gap={6}>
        <Text fw={700} size="sm">
          Доступные коды
        </Text>
        <Text
          c={item.availableCodes.length > 0 ? undefined : 'dimmed'}
          size="sm"
        >
          {item.availableCodes.length > 0
            ? item.availableCodes.join(', ')
            : 'Свободных кодов нет.'}
        </Text>
      </Stack>
    </Stack>
  );
}
