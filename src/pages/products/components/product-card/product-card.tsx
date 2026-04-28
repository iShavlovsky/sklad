import type { ReactElement } from 'react';

import type { ProductRecord } from '@/domain/directories/product.record.ts';
import {
  MiniRecordCard,
  PreviewMetricGrid,
  type RecordMetric,
} from '@/shared/ui/record-card';

import { formatProductDate } from '../../lib/products-page-formatters.ts';

interface ProductCardProps {
  categoryName: string | null;
  onOpen: () => void;
  product: ProductRecord;
  supplierName: string | null;
}

function buildProductMetrics(
  product: ProductRecord,
  supplierName: string | null,
  categoryName: string | null
): RecordMetric[] {
  return [
    { field: 'supplier', label: 'Поставщик', value: supplierName || '-' },
    { field: 'category', label: 'Категория', value: categoryName || '-' },
    {
      field: 'updatedAt',
      label: 'Обновлено',
      value: formatProductDate(product.updatedAt),
    },
  ];
}

export function ProductCard({
  categoryName,
  onOpen,
  product,
  supplierName,
}: Readonly<ProductCardProps>): ReactElement {
  return (
    <MiniRecordCard
      badges={[
        product.isArchived ? { color: 'gray', label: 'Архив' } : null,
        supplierName ? { color: 'grape', label: supplierName } : null,
        categoryName ? { color: 'blue', label: categoryName } : null,
      ].filter((badge): badge is { color: string; label: string } =>
        Boolean(badge)
      )}
      description={product.note || 'Описание не заполнено.'}
      metrics={buildProductMetrics(product, supplierName, categoryName)}
      onOpen={onOpen}
      openLabel={`Открыть товар ${product.name}`}
      primaryValue={product.isArchived ? 'Архивный товар' : 'Активный товар'}
      subtitle={`Обновлено ${formatProductDate(product.updatedAt)}`}
      title={product.name}
    />
  );
}

export function ProductPreviewContent({
  categoryName,
  product,
  supplierName,
}: Readonly<{
  categoryName: string | null;
  product: ProductRecord;
  supplierName: string | null;
}>): ReactElement {
  return (
    <PreviewMetricGrid
      metrics={[
        ...buildProductMetrics(product, supplierName, categoryName),
        {
          field: 'subjectKind',
          label: 'Статус',
          value: product.isArchived ? 'Архивный' : 'Активный',
        },
        { field: 'note', label: 'Заметка', value: product.note || '-' },
      ]}
    />
  );
}
