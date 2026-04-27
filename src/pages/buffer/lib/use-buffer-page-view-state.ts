import { useMemo, useState } from 'react';

import type { BufferItem } from '@/features/buffer/core/buffer-core.public.ts';
import type { CollectionFilterMenuConfig } from '@/shared/ui/collection-section/types.ts';

import {
  BUFFER_PAGE_SORT_OPTIONS,
  formatBufferKind,
  formatBufferSource,
} from './buffer-page-formatters.ts';
import {
  type BufferPageSortKey,
  filterAndSortBufferItems,
} from './buffer-page-mappers.ts';

export function useBufferPageViewState(items: BufferItem[]) {
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState<string | null>('capturedAt-desc');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);

  const visibleItems = useMemo(
    () =>
      filterAndSortBufferItems(items, {
        kind: kindFilter,
        reversed: sortValue !== null && !sortValue.endsWith('-asc'),
        search: searchValue,
        sortBy: (sortValue?.split('-')[0] ?? 'capturedAt') as BufferPageSortKey,
        source: sourceFilter,
      }),
    [items, kindFilter, searchValue, sortValue, sourceFilter]
  );

  const sourceOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.source?.trim()).filter(Boolean))
      ) as string[],
    [items]
  );
  const kindOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.kind?.trim()).filter(Boolean))
      ) as string[],
    [items]
  );

  const filterMenu = useMemo<CollectionFilterMenuConfig>(
    () => ({
      triggerLabel: 'Фильтры',
      groups: [
        {
          key: 'source',
          label: 'Источник',
          items: [
            {
              checked: sourceFilter === null,
              closeMenuOnClick: false,
              key: 'source-all',
              label: 'Все источники',
              onClick: () => setSourceFilter(null),
            },
            ...sourceOptions.map((value) => ({
              checked: sourceFilter === value,
              closeMenuOnClick: false,
              key: `source-${value}`,
              label: formatBufferSource(value),
              onClick: () => setSourceFilter(value),
            })),
          ],
        },
        {
          key: 'kind',
          label: 'Тип кода',
          items: [
            {
              checked: kindFilter === null,
              closeMenuOnClick: false,
              key: 'kind-all',
              label: 'Все типы',
              onClick: () => setKindFilter(null),
            },
            ...kindOptions.map((value) => ({
              checked: kindFilter === value,
              closeMenuOnClick: false,
              key: `kind-${value}`,
              label: formatBufferKind(value),
              onClick: () => setKindFilter(value),
            })),
          ],
        },
      ],
    }),
    [kindFilter, kindOptions, sourceFilter, sourceOptions]
  );

  return {
    BUFFER_PAGE_SORT_OPTIONS,
    filterMenu,
    searchValue,
    selectedIds,
    setSearchValue,
    setSelectedIds,
    setSortValue,
    sortValue,
    visibleItems,
  };
}

export type BufferPageViewState = ReturnType<typeof useBufferPageViewState>;
