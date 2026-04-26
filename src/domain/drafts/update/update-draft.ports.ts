import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';

import type { DraftRecord } from '../draft.record.ts';

export interface DraftUpdateRepositoryPort {
  getById(id: string): Promise<DraftRecord | undefined>;
  put(record: DraftRecord): Promise<string>;
}

export interface DraftUpdateRecordCodeRepositoryPort {
  replaceOwnerCodes(
    ownerKind: 'draft',
    ownerId: string,
    records: RecordCodeRecord[]
  ): Promise<void>;
}

export interface UpdateDraftDependencies {
  draftRepository: DraftUpdateRepositoryPort;
  recordCodeRepository: DraftUpdateRecordCodeRepositoryPort;
}
