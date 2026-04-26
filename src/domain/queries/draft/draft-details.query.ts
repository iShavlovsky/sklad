import type { RecordCodeKind } from '@/domain/common/record-kinds.ts';
import type { DraftRecord } from '@/domain/drafts/draft.record.ts';

export interface DraftDetailsQuery {
  id: string;
}

export interface DraftDetailsCodeItem {
  id: string;
  kind: RecordCodeKind;
  value: string;
}

export interface DraftDetails {
  draft: DraftRecord;
  codes: DraftDetailsCodeItem[];
}
