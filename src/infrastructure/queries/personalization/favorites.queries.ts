import type {
  FavoriteDetails,
  FavoriteDetailsQuery,
  FavoriteListItem,
  FavoriteListQuery,
} from '@/domain/queries/personalization/index.ts';
import type { FavoriteRepository } from '@/infrastructure/repositories/personalization/favorite.repository.ts';

export class FavoritesQueries {
  private readonly repository: FavoriteRepository;

  public constructor(repository: FavoriteRepository) {
    this.repository = repository;
  }

  public async list(_query: FavoriteListQuery): Promise<FavoriteListItem[]> {
    const rows = await this.repository.list();
    return [...rows].sort(
      (left, right) =>
        left.order - right.order ||
        left.createdAt.localeCompare(right.createdAt) ||
        left.id.localeCompare(right.id)
    );
  }

  public async details(
    query: FavoriteDetailsQuery
  ): Promise<FavoriteDetails | null> {
    const favorite = await this.repository.getById(query.id);
    if (favorite === undefined) {
      return null;
    }

    return { favorite };
  }
}
