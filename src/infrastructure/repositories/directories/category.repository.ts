import type { Table } from 'dexie';

import type { CategoryRecord } from '@/domain/directories/category.record';

import { BaseNamedRepository } from '../base/base-named.repository';

export class CategoryRepository extends BaseNamedRepository<CategoryRecord> {
  public constructor(table: Table<CategoryRecord, string>) {
    super(table);
  }
}
