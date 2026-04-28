import type { CollectionSortOption } from '@/shared/ui/collection-section/types.ts';

export const PRODUCTS_SORT_OPTIONS: CollectionSortOption[] = [
  { label: 'По названию', value: 'name-asc' },
  { label: 'Сначала обновлённые', value: 'updatedAt-desc' },
  { label: 'Сначала новые', value: 'createdAt-desc' },
];

export function formatProductDate(value: string): string {
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
