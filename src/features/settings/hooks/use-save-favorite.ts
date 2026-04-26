import { saveFavoriteService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the favorite save facade.
 */
export function useSaveFavorite(): typeof saveFavoriteService {
  return saveFavoriteService;
}
