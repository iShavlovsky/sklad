import type { Table } from 'dexie';

import { isDefined } from '@/shared/utils/type-guards.ts';

export abstract class BaseRepository<TRecord extends { id: string }> {
  protected readonly table: Table<TRecord, string>;

  protected constructor(table: Table<TRecord, string>) {
    this.table = table;
  }

  public getById(id: string): Promise<TRecord | undefined> {
    return this.table.get(id);
  }

  public put(record: TRecord): Promise<string> {
    return this.table.put(record);
  }

  public delete(id: string): Promise<void> {
    return this.table.delete(id);
  }

  public list(): Promise<TRecord[]> {
    return this.table.toArray();
  }

  public async listByIds(ids: string[]): Promise<TRecord[]> {
    const rows = await this.table.bulkGet(ids);
    return rows.filter(isDefined);
  }
}
