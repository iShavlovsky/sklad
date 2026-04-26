import type { CollectionSortOption } from '@/shared/ui/collection-section/types.ts';

export const BUFFER_PAGE_SORT_OPTIONS: CollectionSortOption[] = [
  { label: 'Сначала новые', value: 'capturedAt-desc' },
  { label: 'Сначала старые', value: 'capturedAt-asc' },
  { label: 'По номеру', value: 'value-asc' },
  { label: 'По источнику', value: 'source-asc' },
  { label: 'По типу', value: 'kind-asc' },
];

export function formatBufferCapturedAt(value: string): string {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(timestamp);
}

export function formatBufferSource(value: string | undefined): string {
  switch (value) {
    case 'scanner-live':
      return 'Сканер';
    case 'scanner-photo':
      return 'Фото';
    case 'manual':
    case 'manual-import':
      return 'Вручную';
    default:
      return value?.trim() ? value : '—';
  }
}

export function formatBufferKind(value: string | undefined): string {
  return value?.trim() ? value : '—';
}
