import { deleteProfileService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the profile delete facade.
 */
export function useDeleteProfile(): typeof deleteProfileService {
  return deleteProfileService;
}
