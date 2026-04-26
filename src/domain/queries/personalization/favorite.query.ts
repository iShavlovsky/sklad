import type { FavoriteRecord } from '@/domain/settings/favorite.record.ts';

export type FavoriteListQuery = Record<string, never>;

export interface FavoriteDetailsQuery {
  id: string;
}

export type FavoriteListItem = FavoriteRecord;

export interface FavoriteDetails {
  favorite: FavoriteListItem;
}
