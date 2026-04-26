import type {
  SettingDetails,
  SettingDetailsQuery,
  SettingListItem,
  SettingListQuery,
} from '@/domain/queries/personalization/index.ts';
import type { SettingsRepository } from '@/infrastructure/repositories/personalization/settings.repository.ts';

export class SettingsQueries {
  private readonly repository: SettingsRepository;

  public constructor(repository: SettingsRepository) {
    this.repository = repository;
  }

  public async list(_query: SettingListQuery): Promise<SettingListItem[]> {
    const rows = await this.repository.list();
    return [...rows].sort((left, right) => left.key.localeCompare(right.key));
  }

  public async details(
    query: SettingDetailsQuery
  ): Promise<SettingDetails | null> {
    const setting = await this.repository.getByKey(query.key);
    if (setting === undefined) {
      return null;
    }

    return { setting };
  }
}
