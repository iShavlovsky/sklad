import { describe, expect, it, vi } from 'vitest';

import {
  type FavoriteRepositoryPort,
  SaveFavoriteService,
} from '@/domain/settings/write/favorite.write.ts';

function createFavoriteRepositoryStub(): FavoriteRepositoryPort {
  return {
    delete: vi.fn(),
    getById: vi.fn(),
    list: vi.fn(),
    put: vi.fn(),
  };
}

describe('SaveFavoriteService', () => {
  it('creates a favorite with the provided id when the record is missing', async () => {
    const service = new SaveFavoriteService();
    const repository = createFavoriteRepositoryStub();

    vi.mocked(repository.getById).mockResolvedValue(undefined);
    vi.mocked(repository.put).mockResolvedValue('favorite-home-buffer');

    const result = await service.execute(
      {
        id: 'favorite-home-buffer',
        icon: 'buffer',
        label: 'Буфер',
        order: 1,
        route: '/buffer',
      },
      repository
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.action).toBe('created');
    expect(result.favorite.id).toBe('favorite-home-buffer');
    expect(result.favorite.createdAt).toBe(result.favorite.updatedAt);
    expect(repository.put).toHaveBeenCalledWith(result.favorite);
  });
});
