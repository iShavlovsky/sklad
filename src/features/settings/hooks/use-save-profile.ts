import { saveProfileService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the profile save facade.
 */
export function useSaveProfile(): typeof saveProfileService {
  return saveProfileService;
}
