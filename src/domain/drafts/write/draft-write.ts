import { createRecordCodeRecords, type RecordCodeRecord } from '@/domain/codes';

import type { DraftPayload } from '../draft.payload.ts';
import type { DraftRecord } from '../draft.record.ts';
import type { DraftCodeInput } from '../draft-code.input.ts';

export interface BuildDraftRecordInput {
  id: string;
  kind: DraftRecord['kind'];
  title: string;
  payload: DraftPayload;
  createdAt: string;
  updatedAt: string;
}

export function buildDraftRecord(input: BuildDraftRecordInput): DraftRecord {
  const title = input.title.trim();

  return {
    id: input.id,
    kind: input.kind,
    title,
    normalizedTitle: title.toLowerCase(),
    payload: input.payload,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export function createDraftRecordCodes(
  ownerId: string,
  createdAt: string,
  codes: DraftCodeInput[]
): RecordCodeRecord[] {
  return createRecordCodeRecords('draft', ownerId, createdAt, codes);
}
