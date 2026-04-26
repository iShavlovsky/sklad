import type { Table } from 'dexie';

import type { SettingRecord } from '@/domain/settings/setting.record.ts';

export class SettingsRepository {
  private readonly table: Table<SettingRecord, string>;

  public constructor(table: Table<SettingRecord, string>) {
    this.table = table;
  }

  public getByKey(key: string): Promise<SettingRecord | undefined> {
    return this.table.get(key);
  }

  public put(record: SettingRecord): Promise<string> {
    return this.table.put(record);
  }

  public delete(key: string): Promise<void> {
    return this.table.delete(key);
  }

  public list(): Promise<SettingRecord[]> {
    return this.table.toArray();
  }
}
