import { useLiveQuery } from 'dexie-react-hooks';

import type { RecordCodeLookupResult } from '@/domain/queries/record-code/record-code-lookup.query.ts';
import { appDb } from '@/infrastructure/db';
import { RecordCodeQueries } from '@/infrastructure/queries/codes/record-code.queries.ts';

const recordCodeQueries = new RecordCodeQueries(appDb);

/**
 * Live lookup hook for normalized code matches.
 *
 * Pass a normalized value or `null`/`undefined` to skip lookup.
 */
export function useRecordCodeLookup(
  normalizedValue: string | null | undefined
): RecordCodeLookupResult | null | undefined {
  return useLiveQuery(
    () =>
      normalizedValue ? recordCodeQueries.lookup({ normalizedValue }) : null,
    [normalizedValue]
  );
}
