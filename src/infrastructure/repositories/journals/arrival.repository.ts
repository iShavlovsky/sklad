import type { Table } from 'dexie';

import type { ArrivalRecord } from '@/domain/entries/arrival/arrival.record';

import { BaseRepository } from '../base/base.repository';

export class ArrivalRepository extends BaseRepository<ArrivalRecord> {
  public constructor(table: Table<ArrivalRecord, string>) {
    super(table);
  }
}
