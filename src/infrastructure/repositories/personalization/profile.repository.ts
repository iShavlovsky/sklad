import type { Table } from 'dexie';

import type { ProfileRecord } from '@/domain/settings/profile.record.ts';

import { BaseRepository } from '../base/base.repository.ts';

export class ProfileRepository extends BaseRepository<ProfileRecord> {
  public constructor(table: Table<ProfileRecord, string>) {
    super(table);
  }

  public list(): Promise<ProfileRecord[]> {
    return this.table.toArray();
  }
}
