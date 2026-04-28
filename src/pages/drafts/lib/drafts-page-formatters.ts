import type { RecordKind, SubjectKind } from '@/domain/common/record-kinds.ts';
import type { CollectionSortOption } from '@/shared/ui/collection-section/types.ts';

export const DRAFT_KIND_LABELS: Record<RecordKind, string> = {
  arrival: 'Приход',
  departure: 'Отгрузка',
};

export const DRAFT_SUBJECT_KIND_LABELS: Record<SubjectKind, string> = {
  cashback: 'Кэшбэк',
  money: 'Деньги',
  other: 'Прочее',
  payment: 'Платёж',
  product: 'Товар',
  salary: 'Зарплата',
};

export const DRAFT_SUBJECT_KIND_OPTIONS: SubjectKind[] = [
  'product',
  'money',
  'salary',
  'cashback',
  'payment',
  'other',
];

export const DRAFT_KIND_OPTIONS: RecordKind[] = ['arrival', 'departure'];

export const DRAFTS_SORT_OPTIONS: CollectionSortOption[] = [
  { label: 'Сначала обновлённые', value: 'updatedAt-desc' },
  { label: 'Сначала старые', value: 'updatedAt-asc' },
  { label: 'Сначала созданные', value: 'createdAt-desc' },
  { label: 'По названию', value: 'title-asc' },
];

export function formatDraftDate(value: string): string {
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
