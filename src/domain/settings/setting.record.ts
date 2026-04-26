export interface SettingRecord<T = unknown> {
  key: string;
  value: T;
  updatedAt: string;
}
