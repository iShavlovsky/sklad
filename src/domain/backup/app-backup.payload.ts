import type { ArrivalRecord } from '@/domain/entries/arrival/arrival.record.ts';

import type { RecordCodeRecord } from '../codes/record-code.record.ts';
import type { CategoryRecord } from '../directories/category.record';
import type { ProductRecord } from '../directories/product.record';
import type { SupplierRecord } from '../directories/supplier.record';
import type { DraftRecord } from '../drafts/draft.record';
import type { DepartureRecord } from '../entries/departure.record';
import type { FavoriteRecord } from '../settings/favorite.record';
import type { ProfileRecord } from '../settings/profile.record';
import type { SettingRecord } from '../settings/setting.record';

import type { BackupCheckpointRecord } from './checkpoint/backup-checkpoint.record.ts';
import type { BackupHistoryRecord } from './history/backup-history.record.ts';

export const APP_BACKUP_PAYLOAD_VERSION = 1 as const;

export interface AppBackupPayload {
  exportedAt: string;
  version: typeof APP_BACKUP_PAYLOAD_VERSION;

  suppliers: SupplierRecord[];
  categories: CategoryRecord[];
  products: ProductRecord[];

  arrivals: ArrivalRecord[];
  departures: DepartureRecord[];
  drafts: DraftRecord[];
  recordCodes: RecordCodeRecord[];

  settings: SettingRecord[];
  favorites: FavoriteRecord[];
  profiles: ProfileRecord[];

  backupCheckpoints: BackupCheckpointRecord[];
  backupHistory: BackupHistoryRecord[];
}
