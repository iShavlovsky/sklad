import type { Table } from 'dexie';

import type { DraftRecord } from '@/domain/drafts/draft.record.ts';

import { BaseRepository } from '../base/base.repository.ts';

export class DraftRepository extends BaseRepository<DraftRecord> {
  public constructor(table: Table<DraftRecord, string>) {
    super(table);
  }
}
