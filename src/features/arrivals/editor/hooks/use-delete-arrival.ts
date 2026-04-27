import { deleteArrivalService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the stable arrival deletion facade.
 */
export function useDeleteArrival(): typeof deleteArrivalService {
  return deleteArrivalService;
}
