import type { Table } from 'dexie';

import type { BackupCheckpointRecord } from '@/domain/backup/checkpoint/backup-checkpoint.record.ts';

import { BaseRepository } from '../base/base.repository.ts';

export class BackupCheckpointRepository extends BaseRepository<BackupCheckpointRecord> {
  public constructor(table: Table<BackupCheckpointRecord, string>) {
    super(table);
  }

  public list(): Promise<BackupCheckpointRecord[]> {
    return this.table.toArray();
  }
}
