import type { SettingRecord } from '@/domain/settings/setting.record.ts';

export type SettingListQuery = Record<string, never>;

export interface SettingDetailsQuery {
  key: string;
}

export type SettingListItem = SettingRecord<unknown>;

export interface SettingDetails {
  setting: SettingListItem;
}
