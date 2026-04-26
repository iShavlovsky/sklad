import { useLiveQuery } from 'dexie-react-hooks';

import type { SettingListQuery } from '@/domain/queries/personalization/index.ts';
import type { SettingListItem } from '@/domain/queries/personalization/index.ts';
import { appDb } from '@/infrastructure/db';
import { SettingsQueries } from '@/infrastructure/queries/personalization/settings.queries.ts';
import { SettingsRepository } from '@/infrastructure/repositories/personalization/settings.repository.ts';

const settingsRepository = new SettingsRepository(appDb.settings);
const settingsQueries = new SettingsQueries(settingsRepository);
const settingsListQuery: SettingListQuery = {};

/**
 * Live query hook for durable settings list reads.
 */
export function useSettingsList(): SettingListItem[] {
  return (
    useLiveQuery(
      () => settingsQueries.list(settingsListQuery),
      [settingsListQuery]
    ) ?? []
  );
}
