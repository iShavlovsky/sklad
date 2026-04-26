import type { Table } from 'dexie';

import type { ProductRecord } from '@/domain/directories/product.record';

import { BaseNamedRepository } from '../base/base-named.repository';

export class ProductRepository extends BaseNamedRepository<ProductRecord> {
  public constructor(table: Table<ProductRecord, string>) {
    super(table);
  }
}
