import { useLiveQuery } from 'dexie-react-hooks';

import type { DraftDetails } from '@/domain/queries/draft/draft-details.query.ts';
import { appDb } from '@/infrastructure/db';
import { DraftQueries } from '@/infrastructure/queries/journals/draft.queries.ts';

const draftQueries = new DraftQueries(appDb);

/**
 * Live query hook for a single draft details read.
 */
export function useDraftDetails(
  id: string | null | undefined
): DraftDetails | null | undefined {
  return useLiveQuery(() => (id ? draftQueries.details({ id }) : null), [id]);
}
