import { useLiveQuery } from 'dexie-react-hooks';

import type { DraftListItem } from '@/domain/queries/draft/draft-list.item.ts';
import type { DraftListQuery } from '@/domain/queries/draft/draft-list.query.ts';
import { appDb } from '@/infrastructure/db';
import { DraftQueries } from '@/infrastructure/queries/journals/draft.queries.ts';

const draftQueries = new DraftQueries(appDb);

/**
 * Live query hook for the draft list read surface.
 */
export function useDraftList(query: DraftListQuery): DraftListItem[] {
  return useLiveQuery(() => draftQueries.list(query), [query]) ?? [];
}
