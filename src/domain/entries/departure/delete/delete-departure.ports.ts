import type { DepartureRecord } from '../../departure.record.ts';

export interface DepartureDeleteRepositoryPort {
  getById(id: string): Promise<DepartureRecord | undefined>;
  delete(id: string): Promise<void>;
}

export interface DepartureDeleteRecordCodeRepositoryPort {
  deleteOwnerCodes(ownerKind: 'departure', ownerId: string): Promise<void>;
}

export interface DeleteDepartureDependencies {
  departureRepository: DepartureDeleteRepositoryPort;
  recordCodeRepository: DepartureDeleteRecordCodeRepositoryPort;
}
