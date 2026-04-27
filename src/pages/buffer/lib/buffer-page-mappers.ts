import type { BufferItem } from '@/features/buffer/core/buffer-core.public.ts';
import { normalizeText } from '@/shared/utils/normalize-text.ts';

export type BufferPageSortKey = 'capturedAt' | 'kind' | 'source' | 'value';

export interface BufferPageFilterSortOptions {
  kind: string | null;
  reversed: boolean;
  search: string;
  source: string | null;
  sortBy: BufferPageSortKey;
}

function formatCapturedAtSearchValue(value: string): string {
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

function getSearchHaystack(item: BufferItem): string[] {
  return [
    item.value,
    item.kind ?? '',
    item.source ?? '',
    item.capturedAt,
    formatCapturedAtSearchValue(item.capturedAt),
  ];
}

function compareText(left: string, right: string, reversed: boolean): number {
  return reversed
    ? right.localeCompare(left, 'ru')
    : left.localeCompare(right, 'ru');
}

export function filterAndSortBufferItems(
  items: BufferItem[],
  options: BufferPageFilterSortOptions
): BufferItem[] {
  const normalizedSearch = normalizeText(options.search);

  const searchFilteredItems =
    normalizedSearch === null
      ? items
      : items.filter((item) =>
          getSearchHaystack(item).some((part) => {
            const normalizedPart = normalizeText(part);
            return normalizedPart?.includes(normalizedSearch) ?? false;
          })
        );

  const filteredItems = searchFilteredItems.filter((item) => {
    const matchesSource =
      options.source === null || (item.source ?? null) === options.source;
    const matchesKind =
      options.kind === null || (item.kind ?? null) === options.kind;

    return matchesSource && matchesKind;
  });

  return [...filteredItems].sort((left, right) => {
    switch (options.sortBy) {
      case 'kind':
        return compareText(left.kind ?? '', right.kind ?? '', options.reversed);
      case 'source':
        return compareText(
          left.source ?? '',
          right.source ?? '',
          options.reversed
        );
      case 'value':
        return compareText(left.value, right.value, options.reversed);
      case 'capturedAt':
      default:
        return options.reversed
          ? right.capturedAt.localeCompare(left.capturedAt)
          : left.capturedAt.localeCompare(right.capturedAt);
    }
  });
}
