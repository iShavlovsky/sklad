import { publishDraftService } from '@/infrastructure/services';

/**
 * UI-facing hook that publishes a draft into a durable arrival or departure.
 */
export function usePublishDraft(): typeof publishDraftService {
  return publishDraftService;
}
