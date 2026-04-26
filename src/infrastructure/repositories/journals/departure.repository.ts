import type { Table } from 'dexie';

import type { DepartureRecord } from '@/domain/entries/departure.record.ts';

import { BaseRepository } from '../base/base.repository.ts';

export class DepartureRepository extends BaseRepository<DepartureRecord> {
  public constructor(table: Table<DepartureRecord, string>) {
    super(table);
  }

  public countByBasedOnArrivalId(arrivalId: string): Promise<number> {
    return this.table.where('basedOnArrivalId').equals(arrivalId).count();
  }
}
