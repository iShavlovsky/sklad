import { deleteFavoriteService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the favorite delete facade.
 */
export function useDeleteFavorite(): typeof deleteFavoriteService {
  return deleteFavoriteService;
}
