import { useMemo, useState } from 'react';

import type { SubjectKind } from '@/domain/common/record-kinds.ts';
import { useStockList } from '@/features/stocks/data/hooks/use-stock-list.ts';
import type { CollectionFilterMenuConfig } from '@/shared/ui/collection-section/types.ts';

import {
  STOCK_SUBJECT_KIND_LABELS,
  STOCK_SUBJECT_KIND_OPTIONS,
} from './stocks-page-formatters.ts';

export function useStocksPageViewState() {
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState<string | null>('updatedAt-desc');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [subjectKind, setSubjectKind] = useState<SubjectKind | null>(null);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);

  const stocks = useStockList({
    filters: {
      search: searchValue,
      supplierId: null,
      productId: null,
      categoryId: null,
      subjectKind,
      inStockOnly,
    },
    sort:
      sortValue === 'balance-desc'
        ? { direction: 'desc', field: 'balance' }
        : sortValue === 'title-asc'
          ? { direction: 'asc', field: 'title' }
          : { direction: 'desc', field: 'updatedAt' },
    limit: null,
    offset: 0,
  });

  const selectedStock =
    selectedStockId === null
      ? null
      : (stocks.find((item) => item.id === selectedStockId) ?? null);

  const filterMenu = useMemo<CollectionFilterMenuConfig>(
    () => ({
      triggerLabel: 'Фильтры',
      groups: [
        {
          key: 'balance',
          label: 'Баланс',
          items: [
            {
              checked: inStockOnly,
              closeMenuOnClick: false,
              key: 'in-stock-only',
              label: 'Только положительный остаток',
              onClick: () => setInStockOnly((current) => !current),
            },
          ],
        },
        {
          key: 'subject-kind',
          label: 'Тип позиции',
          items: [
            {
              key: 'subject-kind-root',
              label: subjectKind
                ? STOCK_SUBJECT_KIND_LABELS[subjectKind]
                : 'Все типы',
              onClick: () => undefined,
              submenu: [
                {
                  checked: subjectKind === null,
                  closeMenuOnClick: false,
                  key: 'subject-kind-all',
                  label: 'Все типы',
                  onClick: () => setSubjectKind(null),
                },
                ...STOCK_SUBJECT_KIND_OPTIONS.map((value) => ({
                  checked: subjectKind === value,
                  closeMenuOnClick: false,
                  key: `subject-kind-${value}`,
                  label: STOCK_SUBJECT_KIND_LABELS[value],
                  onClick: () => setSubjectKind(value),
                })),
              ],
            },
          ],
        },
      ],
    }),
    [inStockOnly, subjectKind]
  );

  function openDetails(stockId: string): void {
    setSelectedStockId(stockId);
  }

  function closeDetails(): void {
    setSelectedStockId(null);
  }

  return {
    closeDetails,
    filterMenu,
    inStockOnly,
    openDetails,
    searchValue,
    selectedStock,
    setSearchValue,
    setSortValue,
    sortValue,
    stocks,
  };
}

export type StocksPageViewState = ReturnType<typeof useStocksPageViewState>;
