import Dexie, { type Table } from 'dexie';

import type { BackupCheckpointRecord } from '@/domain/backup/checkpoint/backup-checkpoint.record.ts';
import type { BackupHistoryRecord } from '@/domain/backup/history/backup-history.record.ts';
import type { RecordCodeRecord } from '@/domain/codes/record-code.record.ts';
import type { CategoryRecord } from '@/domain/directories/category.record.ts';
import type { ProductRecord } from '@/domain/directories/product.record.ts';
import type { SupplierRecord } from '@/domain/directories/supplier.record.ts';
import type { DraftRecord } from '@/domain/drafts/draft.record.ts';
import type { ArrivalRecord } from '@/domain/entries/arrival/arrival.record.ts';
import type { DepartureRecord } from '@/domain/entries/departure.record.ts';
import type { FavoriteRecord } from '@/domain/settings/favorite.record.ts';
import type { ProfileRecord } from '@/domain/settings/profile.record.ts';
import type { SettingRecord } from '@/domain/settings/setting.record.ts';

import { registerMigrations } from './app-db.migrations';
import { APP_DB_NAME, APP_DB_SCHEMA } from './app-db.schema';
import { TABLE_NAMES } from './app-db.tables.ts';

export class AppDb extends Dexie {
  suppliers: Table<SupplierRecord, string>;
  categories: Table<CategoryRecord, string>;
  products: Table<ProductRecord, string>;

  arrivals: Table<ArrivalRecord, string>;
  departures: Table<DepartureRecord, string>;
  drafts: Table<DraftRecord, string>;
  recordCodes: Table<RecordCodeRecord, string>;

  settings: Table<SettingRecord, string>;
  favorites: Table<FavoriteRecord, string>;
  profiles: Table<ProfileRecord, string>;

  backupCheckpoints: Table<BackupCheckpointRecord, string>;
  backupHistory: Table<BackupHistoryRecord, string>;

  public constructor() {
    super(APP_DB_NAME);

    this.version(1).stores(APP_DB_SCHEMA);
    registerMigrations(this);

    this.suppliers = this.table(TABLE_NAMES.suppliers);
    this.categories = this.table(TABLE_NAMES.categories);
    this.products = this.table(TABLE_NAMES.products);

    this.arrivals = this.table(TABLE_NAMES.arrivals);
    this.departures = this.table(TABLE_NAMES.departures);
    this.drafts = this.table(TABLE_NAMES.drafts);
    this.recordCodes = this.table(TABLE_NAMES.recordCodes);

    this.settings = this.table(TABLE_NAMES.settings);
    this.favorites = this.table(TABLE_NAMES.favorites);
    this.profiles = this.table(TABLE_NAMES.profiles);

    this.backupCheckpoints = this.table(TABLE_NAMES.backupCheckpoints);
    this.backupHistory = this.table(TABLE_NAMES.backupHistory);
  }
}

export const appDb = new AppDb();
