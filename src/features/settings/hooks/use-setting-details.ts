import { useLiveQuery } from 'dexie-react-hooks';

import type { SettingDetails } from '@/domain/queries/personalization/index.ts';
import { appDb } from '@/infrastructure/db';
import { SettingsQueries } from '@/infrastructure/queries/personalization/settings.queries.ts';
import { SettingsRepository } from '@/infrastructure/repositories/personalization/settings.repository.ts';

const settingsRepository = new SettingsRepository(appDb.settings);
const settingsQueries = new SettingsQueries(settingsRepository);

/**
 * Live query hook for a single durable setting by key.
 */
export function useSettingDetails(
  key: string | null | undefined
): SettingDetails | null | undefined {
  return useLiveQuery(
    () => (key ? settingsQueries.details({ key }) : null),
    [key]
  );
}
