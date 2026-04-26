import type { Table } from 'dexie';

import type { BackupHistoryRecord } from '@/domain/backup/history/backup-history.record.ts';

import { BaseRepository } from '../base/base.repository.ts';

export class BackupHistoryRepository extends BaseRepository<BackupHistoryRecord> {
  public constructor(table: Table<BackupHistoryRecord, string>) {
    super(table);
  }

  public list(): Promise<BackupHistoryRecord[]> {
    return this.table.toArray();
  }
}
