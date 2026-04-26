import type { RecordKind } from '../common/record-kinds.ts';

import type { DraftPayload } from './draft.payload.ts';

export interface DraftRecord {
  id: string;
  kind: RecordKind;
  title: string;
  normalizedTitle: string;
  payload: DraftPayload;
  createdAt: string;
  updatedAt: string;
}
