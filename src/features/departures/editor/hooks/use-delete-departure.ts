import { deleteDepartureService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the stable departure deletion facade.
 */
export function useDeleteDeparture(): typeof deleteDepartureService {
  return deleteDepartureService;
}
