import { useLiveQuery } from 'dexie-react-hooks';

import type { ArrivalDetails } from '@/domain/queries/arrival/arrival-details.query.ts';
import { appDb } from '@/infrastructure/db';
import { ArrivalQueries } from '@/infrastructure/queries/journals/arrival.queries.ts';

const arrivalQueries = new ArrivalQueries(appDb);

/**
 * Live query hook for a single arrival details read.
 */
export function useArrivalDetails(
  id: string | null | undefined
): ArrivalDetails | null | undefined {
  return useLiveQuery(() => (id ? arrivalQueries.details({ id }) : null), [id]);
}
