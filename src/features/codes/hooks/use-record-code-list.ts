import { useLiveQuery } from 'dexie-react-hooks';

import type { RecordCodeListItem } from '@/domain/queries/record-code/record-code-list.item.ts';
import type { RecordCodeListQuery } from '@/domain/queries/record-code/record-code-list.query.ts';
import { appDb } from '@/infrastructure/db';
import { RecordCodeQueries } from '@/infrastructure/queries/codes/record-code.queries.ts';

const recordCodeQueries = new RecordCodeQueries(appDb);

/**
 * Live query hook for the record-code list read surface.
 */
export function useRecordCodeList(
  query: RecordCodeListQuery
): RecordCodeListItem[] {
  return useLiveQuery(() => recordCodeQueries.list(query), [query]) ?? [];
}
