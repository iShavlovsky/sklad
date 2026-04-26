import type { ProfileRecord } from '@/domain/settings/profile.record.ts';

export type ProfileListQuery = Record<string, never>;

export interface ProfileDetailsQuery {
  id: string;
}

export type ProfileListItem = ProfileRecord;

export interface ProfileDetails {
  profile: ProfileListItem;
}
