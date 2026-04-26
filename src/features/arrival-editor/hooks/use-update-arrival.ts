import { updateArrivalService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the stable arrival update facade.
 */
export function useUpdateArrival(): typeof updateArrivalService {
  return updateArrivalService;
}
