import { useLiveQuery } from 'dexie-react-hooks';

import type { ArrivalListItem } from '@/domain/queries/arrival/arrival-list.item.ts';
import type { ArrivalListQuery } from '@/domain/queries/arrival/arrival-list.query.ts';
import { appDb } from '@/infrastructure/db';
import { ArrivalQueries } from '@/infrastructure/queries/journals/arrival.queries.ts';

const arrivalQueries = new ArrivalQueries(appDb);

/**
 * Live query hook for the arrival list read surface.
 */
export function useArrivalList(query: ArrivalListQuery): ArrivalListItem[] {
  return useLiveQuery(() => arrivalQueries.list(query), [query]) ?? [];
}
