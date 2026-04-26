import type { DraftRecord } from '../draft.record.ts';

export interface DraftDeleteRepositoryPort {
  getById(id: string): Promise<DraftRecord | undefined>;
  delete(id: string): Promise<void>;
}

export interface DraftDeleteRecordCodeRepositoryPort {
  deleteOwnerCodes(ownerKind: 'draft', ownerId: string): Promise<void>;
}

export interface DeleteDraftDependencies {
  draftRepository: DraftDeleteRepositoryPort;
  recordCodeRepository: DraftDeleteRecordCodeRepositoryPort;
}
