import { saveSettingService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the durable setting save facade.
 */
export function useSaveSetting(): typeof saveSettingService {
  return saveSettingService;
}
