import type { Table } from 'dexie';

import { BaseRepository } from './base.repository.ts';

interface NamedRecord {
  id: string;
  normalizedName: string;
}

export abstract class BaseNamedRepository<
  TRecord extends NamedRecord,
> extends BaseRepository<TRecord> {
  protected constructor(table: Table<TRecord, string>) {
    super(table);
  }

  public findByNormalizedName(
    normalizedName: string
  ): Promise<TRecord | undefined> {
    return this.table.where('normalizedName').equals(normalizedName).first();
  }
}
