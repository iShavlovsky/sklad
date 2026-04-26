import { useLiveQuery } from 'dexie-react-hooks';

import type { FavoriteListQuery } from '@/domain/queries/personalization/index.ts';
import type { FavoriteListItem } from '@/domain/queries/personalization/index.ts';
import { appDb } from '@/infrastructure/db';
import { FavoritesQueries } from '@/infrastructure/queries/personalization/favorites.queries.ts';
import { FavoriteRepository } from '@/infrastructure/repositories/personalization/favorite.repository.ts';

const favoriteRepository = new FavoriteRepository(appDb.favorites);
const favoriteQueries = new FavoritesQueries(favoriteRepository);
const favoriteListQuery: FavoriteListQuery = {};

/**
 * Live query hook for favorite list reads.
 */
export function useFavoriteList(): FavoriteListItem[] {
  return (
    useLiveQuery(
      () => favoriteQueries.list(favoriteListQuery),
      [favoriteListQuery]
    ) ?? []
  );
}
