import { useLiveQuery } from 'dexie-react-hooks';

import type { ProfileDetails } from '@/domain/queries/personalization/index.ts';
import { appDb } from '@/infrastructure/db';
import { ProfilesQueries } from '@/infrastructure/queries/personalization/profiles.queries.ts';
import { ProfileRepository } from '@/infrastructure/repositories/personalization/profile.repository.ts';

const profileRepository = new ProfileRepository(appDb.profiles);
const profileQueries = new ProfilesQueries(profileRepository);

/**
 * Live query hook for a single profile by id.
 */
export function useProfileDetails(
  id: string | null | undefined
): ProfileDetails | null | undefined {
  return useLiveQuery(() => (id ? profileQueries.details({ id }) : null), [id]);
}
