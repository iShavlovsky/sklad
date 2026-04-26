import type { Table } from 'dexie';

import type { RecordCodeRecord } from '@/domain/codes/record-code.record';
import type { RecordCodeOwnerKind } from '@/domain/common/record-kinds';

import { BaseRepository } from '../base/base.repository';

export class RecordCodeRepository extends BaseRepository<RecordCodeRecord> {
  public constructor(table: Table<RecordCodeRecord, string>) {
    super(table);
  }

  public listByOwner(
    ownerKind: RecordCodeOwnerKind,
    ownerId: string
  ): Promise<RecordCodeRecord[]> {
    return this.table
      .where('[ownerKind+ownerId]')
      .equals([ownerKind, ownerId])
      .toArray();
  }

  public findByNormalizedValue(
    normalizedValue: string
  ): Promise<RecordCodeRecord[]> {
    return this.table
      .where('normalizedValue')
      .equals(normalizedValue)
      .toArray();
  }

  public async replaceOwnerCodes(
    ownerKind: RecordCodeOwnerKind,
    ownerId: string,
    records: RecordCodeRecord[]
  ): Promise<void> {
    await this.deleteOwnerCodes(ownerKind, ownerId);

    if (!records.length) return;

    await this.table.bulkPut(records);
  }

  public deleteOwnerCodes(
    ownerKind: RecordCodeOwnerKind,
    ownerId: string
  ): Promise<void> {
    return this.table
      .where('[ownerKind+ownerId]')
      .equals([ownerKind, ownerId])
      .delete()
      .then(() => undefined);
  }
}
