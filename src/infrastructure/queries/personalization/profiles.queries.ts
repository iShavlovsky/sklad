import type {
  ProfileDetails,
  ProfileDetailsQuery,
  ProfileListItem,
  ProfileListQuery,
} from '@/domain/queries/personalization/index.ts';
import type { ProfileRepository } from '@/infrastructure/repositories/personalization/profile.repository.ts';

export class ProfilesQueries {
  private readonly repository: ProfileRepository;

  public constructor(repository: ProfileRepository) {
    this.repository = repository;
  }

  public async list(_query: ProfileListQuery): Promise<ProfileListItem[]> {
    const rows = await this.repository.list();
    return [...rows].sort(
      (left, right) =>
        left.displayName.localeCompare(right.displayName) ||
        left.createdAt.localeCompare(right.createdAt) ||
        left.id.localeCompare(right.id)
    );
  }

  public async details(
    query: ProfileDetailsQuery
  ): Promise<ProfileDetails | null> {
    const profile = await this.repository.getById(query.id);
    if (profile === undefined) {
      return null;
    }

    return { profile };
  }
}
