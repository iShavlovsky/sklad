import { createDraftService } from '@/infrastructure/services';

/**
 * UI-facing hook that returns the stable draft creation facade.
 */
export function useCreateDraft(): typeof createDraftService {
  return createDraftService;
}
