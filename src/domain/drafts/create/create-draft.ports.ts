import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';

import type { DraftRecord } from '../draft.record.ts';

export interface DraftRepositoryPort {
  getById(id: string): Promise<DraftRecord | undefined>;
  put(record: DraftRecord): Promise<string>;
}

export interface DraftRecordCodeRepositoryPort {
  replaceOwnerCodes(
    ownerKind: 'draft',
    ownerId: string,
    records: RecordCodeRecord[]
  ): Promise<void>;
}

export interface CreateDraftDependencies {
  draftRepository: DraftRepositoryPort;
  recordCodeRepository: DraftRecordCodeRepositoryPort;
}
