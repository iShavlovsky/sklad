import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';
import type { CreateArrivalDependencies } from '@/domain/entries/arrival/create/create-arrival.ports.ts';
import type { CreateDepartureDependencies } from '@/domain/entries/departure/create/create-departure.ports.ts';

import type { DraftRecord } from '../draft.record.ts';

export interface DraftPublishRepositoryPort {
  getById(id: string): Promise<DraftRecord | undefined>;
  delete(id: string): Promise<void>;
}

export interface DraftPublishRecordCodeRepositoryPort {
  listByOwner(ownerKind: 'draft', ownerId: string): Promise<RecordCodeRecord[]>;
  deleteOwnerCodes(ownerKind: 'draft', ownerId: string): Promise<void>;
}

export interface PublishDraftDependencies {
  draftRepository: DraftPublishRepositoryPort;
  recordCodeRepository: DraftPublishRecordCodeRepositoryPort;
  arrivalCreateDependencies: CreateArrivalDependencies;
  departureCreateDependencies: CreateDepartureDependencies;
}
