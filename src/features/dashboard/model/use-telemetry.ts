import { useMemo } from 'react';
import { useStore } from 'zustand';

import type { ArrivalListQuery } from '@/domain/queries/arrival/arrival-list.query.ts';
import type { DepartureListQuery } from '@/domain/queries/departure/departure-list.query.ts';
import type { DraftListQuery } from '@/domain/queries/draft/draft-list.query.ts';
import type { StockListQuery } from '@/domain/queries/stock/stock-list.query.ts';
import { useArrivalList } from '@/features/arrivals-data/hooks/use-arrival-list.ts';
import { bufferStore } from '@/features/buffer-core/model/buffer-store.ts';
import { useDepartureList } from '@/features/departures-data/hooks/use-departure-list.ts';
import { useDraftList } from '@/features/drafts-data/hooks/use-draft-list.ts';
import { useStockList } from '@/features/stocks-data/hooks/use-stock-list.ts';

export type TelemetryIconKey =
  | 'arrivals'
  | 'departures'
  | 'drafts'
  | 'stocks'
  | 'buffer';

export interface TelemetryItem {
  id: string;
  label: string;
  value: number;
  icon: TelemetryIconKey;
}

const HOME_ARRIVALS_QUERY: ArrivalListQuery = {
  filters: {
    search: '',
    subjectKind: null,
    supplierId: null,
    productId: null,
    categoryId: null,
    hasCodes: null,
    occurredAt: { from: null, to: null },
    createdAt: { from: null, to: null },
    originKind: null,
  },
  sort: {
    field: 'updatedAt',
    direction: 'desc',
  },
  limit: null,
  offset: 0,
};

const HOME_DEPARTURES_QUERY: DepartureListQuery = {
  filters: {
    search: '',
    subjectKind: null,
    supplierId: null,
    productId: null,
    categoryId: null,
    hasCodes: null,
    occurredAt: { from: null, to: null },
    createdAt: { from: null, to: null },
    originKind: null,
    mode: null,
    basedOnArrivalId: null,
  },
  sort: {
    field: 'updatedAt',
    direction: 'desc',
  },
  limit: null,
  offset: 0,
};

const HOME_DRAFTS_QUERY: DraftListQuery = {
  filters: {
    search: '',
    kind: null,
    subjectKind: null,
    updatedAt: { from: null, to: null },
  },
  sort: {
    field: 'updatedAt',
    direction: 'desc',
  },
  limit: null,
  offset: 0,
};

const HOME_STOCK_QUERY: StockListQuery = {
  filters: {
    search: '',
    supplierId: null,
    productId: null,
    categoryId: null,
    subjectKind: null,
    inStockOnly: true,
  },
  sort: {
    field: 'balance',
    direction: 'desc',
  },
  limit: null,
  offset: 0,
};

export function useTelemetry(): TelemetryItem[] {
  const arrivals = useArrivalList(HOME_ARRIVALS_QUERY);
  const departures = useDepartureList(HOME_DEPARTURES_QUERY);
  const drafts = useDraftList(HOME_DRAFTS_QUERY);
  const stocks = useStockList(HOME_STOCK_QUERY);
  const bufferCount = useStore(bufferStore, (state) => state.items.length);

  return useMemo(
    () => [
      {
        id: 'arrivals',
        label: 'Приходы',
        value: arrivals.length,
        icon: 'arrivals',
      },
      {
        id: 'departures',
        label: 'Расходы',
        value: departures.length,
        icon: 'departures',
      },
      {
        id: 'drafts',
        label: 'Черновики',
        value: drafts.length,
        icon: 'drafts',
      },
      {
        id: 'stocks',
        label: 'Остатки',
        value: stocks.length,
        icon: 'stocks',
      },
      {
        id: 'buffer',
        label: 'Буфер',
        value: bufferCount,
        icon: 'buffer',
      },
    ],
    [
      arrivals.length,
      departures.length,
      drafts.length,
      stocks.length,
      bufferCount,
    ]
  );
}
