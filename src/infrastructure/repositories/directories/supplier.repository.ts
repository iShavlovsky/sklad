import type { Table } from 'dexie';

import type { SupplierRecord } from '@/domain/directories/supplier.record';

import { BaseNamedRepository } from '../base/base-named.repository';

export class SupplierRepository extends BaseNamedRepository<SupplierRecord> {
  public constructor(table: Table<SupplierRecord, string>) {
    super(table);
  }
}
