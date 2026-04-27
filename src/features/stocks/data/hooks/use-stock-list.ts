import { useLiveQuery } from 'dexie-react-hooks';

import type { StockListItem } from '@/domain/queries/stock/stock-list.item.ts';
import type { StockListQuery } from '@/domain/queries/stock/stock-list.query.ts';
import { appDb } from '@/infrastructure/db';
import { StockQueries } from '@/infrastructure/queries/stock/stock.queries.ts';

const stockQueries = new StockQueries(appDb);

/**
 * Live query hook for the stock list read surface.
 */
export function useStockList(query: StockListQuery): StockListItem[] {
  return useLiveQuery(() => stockQueries.list(query), [query]) ?? [];
}
