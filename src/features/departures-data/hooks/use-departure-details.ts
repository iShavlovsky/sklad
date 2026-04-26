import { useLiveQuery } from 'dexie-react-hooks';

import type { DepartureDetails } from '@/domain/queries/departure/departure-details.query.ts';
import { appDb } from '@/infrastructure/db';
import { DepartureQueries } from '@/infrastructure/queries/journals/departure.queries.ts';

const departureQueries = new DepartureQueries(appDb);

/**
 * Live query hook for a single departure details read.
 */
export function useDepartureDetails(
  id: string | null | undefined
): DepartureDetails | null | undefined {
  return useLiveQuery(
    () => (id ? departureQueries.details({ id }) : null),
    [id]
  );
}
