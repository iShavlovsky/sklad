import type { Table } from 'dexie';

import type { FavoriteRecord } from '@/domain/settings/favorite.record.ts';

import { BaseRepository } from '../base/base.repository.ts';

export class FavoriteRepository extends BaseRepository<FavoriteRecord> {
  public constructor(table: Table<FavoriteRecord, string>) {
    super(table);
  }

  public list(): Promise<FavoriteRecord[]> {
    return this.table.toArray();
  }
}
