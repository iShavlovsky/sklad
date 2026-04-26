import { createArrivalService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the stable arrival creation facade.
 */
export function useCreateArrival(): typeof createArrivalService {
  return createArrivalService;
}
