import { useLiveQuery } from 'dexie-react-hooks';

import type { ProfileListQuery } from '@/domain/queries/personalization/index.ts';
import type { ProfileListItem } from '@/domain/queries/personalization/index.ts';
import { appDb } from '@/infrastructure/db';
import { ProfilesQueries } from '@/infrastructure/queries/personalization/profiles.queries.ts';
import { ProfileRepository } from '@/infrastructure/repositories/personalization/profile.repository.ts';

const profileRepository = new ProfileRepository(appDb.profiles);
const profileQueries = new ProfilesQueries(profileRepository);
const profileListQuery: ProfileListQuery = {};

/**
 * Live query hook for profile list reads.
 */
export function useProfileList(): ProfileListItem[] {
  return (
    useLiveQuery(
      () => profileQueries.list(profileListQuery),
      [profileListQuery]
    ) ?? []
  );
}
