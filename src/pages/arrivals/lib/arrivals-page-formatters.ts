import type { SubjectKind } from '@/domain/common/record-kinds.ts';
import type { CollectionSortOption } from '@/shared/ui/collection-section/types.ts';

export const ARRIVAL_SUBJECT_KIND_LABELS: Record<SubjectKind, string> = {
  cashback: 'Кэшбэк',
  money: 'Деньги',
  other: 'Прочее',
  payment: 'Платёж',
  product: 'Товар',
  salary: 'Зарплата',
};

export const ARRIVAL_SUBJECT_KIND_OPTIONS: SubjectKind[] = [
  'product',
  'money',
  'salary',
  'cashback',
  'payment',
  'other',
];

export const ARRIVALS_SORT_OPTIONS: CollectionSortOption[] = [
  { label: 'Сначала новые', value: 'occurredAt-desc' },
  { label: 'Сначала старые', value: 'occurredAt-asc' },
  { label: 'По названию', value: 'title-asc' },
  { label: 'По сумме', value: 'amount-desc' },
];

export function formatArrivalOccurredAt(value: string): string {
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

export function formatArrivalAmount(
  amount: number | null,
  currency: string | null
): string {
  if (amount === null) {
    return 'Количество не указано';
  }

  return currency ? `${amount} ${currency}` : `${amount} ед.`;
}
