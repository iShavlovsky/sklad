import { updateDepartureService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the stable departure update facade.
 */
export function useUpdateDeparture(): typeof updateDepartureService {
  return updateDepartureService;
}
