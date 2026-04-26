import type { RecordKind } from '@/domain/common/record-kinds.ts';

import type { DraftPayload } from '../draft.payload.ts';

export interface CreateDraftInput {
  kind: RecordKind;
  title: string;
  payload: DraftPayload;
}
