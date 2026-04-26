import { useLiveQuery } from 'dexie-react-hooks';

import type { RecordCodeDetails } from '@/domain/queries/record-code/record-code-details.query.ts';
import { appDb } from '@/infrastructure/db';
import { RecordCodeQueries } from '@/infrastructure/queries/codes/record-code.queries.ts';

const recordCodeQueries = new RecordCodeQueries(appDb);

/**
 * Live query hook for a single record-code details read.
 */
export function useRecordCodeDetails(
  id: string | null | undefined
): RecordCodeDetails | null | undefined {
  return useLiveQuery(
    () => (id ? recordCodeQueries.details({ id }) : null),
    [id]
  );
}
