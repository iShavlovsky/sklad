import { createDepartureService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the stable departure creation facade.
 */
export function useCreateDeparture(): typeof createDepartureService {
  return createDepartureService;
}
