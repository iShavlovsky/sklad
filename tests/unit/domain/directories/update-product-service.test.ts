import { describe, expect, it, vi } from 'vitest';

import type { ProductRecord } from '@/domain/directories/product.record.ts';
import {
  type UpdateProductRepositoryPort,
  UpdateProductService,
} from '@/domain/directories/update-product.service.ts';

function createProduct(overrides: Partial<ProductRecord>): ProductRecord {
  return {
    categoryId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    id: 'product-1',
    isArchived: false,
    name: 'Old product',
    normalizedName: 'old product',
    note: null,
    supplierId: null,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createRepositoryStub(): UpdateProductRepositoryPort {
  return {
    findByNormalizedName: vi.fn(),
    getById: vi.fn(),
    put: vi.fn(),
  };
}

describe('UpdateProductService', () => {
  it('updates editable product fields', async () => {
    const repository = createRepositoryStub();
    const service = new UpdateProductService();

    vi.mocked(repository.getById).mockResolvedValue(createProduct({}));
    vi.mocked(repository.findByNormalizedName).mockResolvedValue(undefined);
    vi.mocked(repository.put).mockResolvedValue('product-1');

    const result = await service.execute(
      {
        categoryId: 'category-1',
        id: 'product-1',
        isArchived: true,
        name: 'New product',
        note: 'updated',
        supplierId: 'supplier-1',
      },
      repository,
      () => '2026-01-02T00:00:00.000Z'
    );

    expect(result.ok).toBe(true);
    expect(repository.put).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 'category-1',
        id: 'product-1',
        isArchived: true,
        name: 'New product',
        normalizedName: 'new product',
        note: 'updated',
        supplierId: 'supplier-1',
        updatedAt: '2026-01-02T00:00:00.000Z',
      })
    );
  });

  it('rejects duplicate normalized names', async () => {
    const repository = createRepositoryStub();
    const service = new UpdateProductService();

    vi.mocked(repository.getById).mockResolvedValue(createProduct({}));
    vi.mocked(repository.findByNormalizedName).mockResolvedValue(
      createProduct({ id: 'product-2', name: 'New product' })
    );

    await expect(
      service.execute(
        {
          categoryId: null,
          id: 'product-1',
          isArchived: false,
          name: 'New product',
          note: null,
          supplierId: null,
        },
        repository,
        () => '2026-01-02T00:00:00.000Z'
      )
    ).resolves.toEqual({ ok: false, code: 'DUPLICATE_PRODUCT_NAME' });
    expect(repository.put).not.toHaveBeenCalled();
  });
});
