import { updateDraftService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the stable draft update facade.
 */
export function useUpdateDraft(): typeof updateDraftService {
  return updateDraftService;
}
