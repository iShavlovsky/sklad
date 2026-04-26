import { useLiveQuery } from 'dexie-react-hooks';

import type { FavoriteDetails } from '@/domain/queries/personalization/index.ts';
import { appDb } from '@/infrastructure/db';
import { FavoritesQueries } from '@/infrastructure/queries/personalization/favorites.queries.ts';
import { FavoriteRepository } from '@/infrastructure/repositories/personalization/favorite.repository.ts';

const favoriteRepository = new FavoriteRepository(appDb.favorites);
const favoriteQueries = new FavoritesQueries(favoriteRepository);

/**
 * Live query hook for a single favorite by id.
 */
export function useFavoriteDetails(
  id: string | null | undefined
): FavoriteDetails | null | undefined {
  return useLiveQuery(
    () => (id ? favoriteQueries.details({ id }) : null),
    [id]
  );
}
