import type { ArrivalRecord } from '../arrival.record.ts';

export interface ArrivalDeleteRepositoryPort {
  getById(id: string): Promise<ArrivalRecord | undefined>;
  delete(id: string): Promise<void>;
}

export interface ArrivalDeleteDepartureRepositoryPort {
  countByBasedOnArrivalId(arrivalId: string): Promise<number>;
}

export interface ArrivalDeleteRecordCodeRepositoryPort {
  deleteOwnerCodes(ownerKind: 'arrival', ownerId: string): Promise<void>;
}

export interface DeleteArrivalDependencies {
  arrivalRepository: ArrivalDeleteRepositoryPort;
  departureRepository: ArrivalDeleteDepartureRepositoryPort;
  recordCodeRepository: ArrivalDeleteRecordCodeRepositoryPort;
}
