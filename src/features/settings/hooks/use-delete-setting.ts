import { deleteSettingService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the durable setting delete facade.
 */
export function useDeleteSetting(): typeof deleteSettingService {
  return deleteSettingService;
}
