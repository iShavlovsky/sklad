import type { SubjectKind } from '@/domain/common/record-kinds.ts';
import type { CollectionSortOption } from '@/shared/ui/collection-section/types.ts';

export const STOCK_SUBJECT_KIND_LABELS: Record<SubjectKind, string> = {
  cashback: 'Кэшбэк',
  money: 'Деньги',
  other: 'Прочее',
  payment: 'Платёж',
  product: 'Товар',
  salary: 'Зарплата',
};

export const STOCK_SUBJECT_KIND_OPTIONS: SubjectKind[] = [
  'product',
  'money',
  'salary',
  'cashback',
  'payment',
  'other',
];

export const STOCKS_SORT_OPTIONS: CollectionSortOption[] = [
  { label: 'Сначала обновлённые', value: 'updatedAt-desc' },
  { label: 'По балансу', value: 'balance-desc' },
  { label: 'По названию', value: 'title-asc' },
];

export function formatStockDate(value: string): string {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(timestamp);
}
