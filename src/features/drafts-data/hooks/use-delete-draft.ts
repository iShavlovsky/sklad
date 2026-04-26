import { deleteDraftService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the stable draft deletion facade.
 */
export function useDeleteDraft(): typeof deleteDraftService {
  return deleteDraftService;
}
