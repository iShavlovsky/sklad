import { useLiveQuery } from 'dexie-react-hooks';

import type { DepartureListItem } from '@/domain/queries/departure/departure-list.item.ts';
import type { DepartureListQuery } from '@/domain/queries/departure/departure-list.query.ts';
import { appDb } from '@/infrastructure/db';
import { DepartureQueries } from '@/infrastructure/queries/journals/departure.queries.ts';

const departureQueries = new DepartureQueries(appDb);

/**
 * Live query hook for the departure list read surface.
 */
export function useDepartureList(
  query: DepartureListQuery
): DepartureListItem[] {
  return useLiveQuery(() => departureQueries.list(query), [query]) ?? [];
}
