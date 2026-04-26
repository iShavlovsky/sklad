import type { ArrivalDraftPayload } from './arrival-draft.payload.ts';
import type { DepartureDraftPayload } from './departure-draft.payload.ts';

export type DraftPayload = ArrivalDraftPayload | DepartureDraftPayload;
