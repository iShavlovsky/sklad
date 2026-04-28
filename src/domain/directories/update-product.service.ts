import { normalizeDirectoryName } from './normalize-directory-name.ts';
import type { ProductRecord } from './product.record.ts';
import type { UpdateProductInput } from './update-product.input.ts';
import type { UpdateProductResult } from './update-product.result.ts';

export interface UpdateProductRepositoryPort {
  findByNormalizedName(
    normalizedName: string
  ): Promise<ProductRecord | undefined>;
  getById(id: string): Promise<ProductRecord | undefined>;
  put(record: ProductRecord): Promise<string>;
}

export class UpdateProductService {
  public async execute(
    input: UpdateProductInput,
    repository: UpdateProductRepositoryPort,
    now: () => string
  ): Promise<UpdateProductResult> {
    const id = input.id.trim();
    const name = input.name.trim();
    const normalizedName = normalizeDirectoryName(name);

    if (id === '' || normalizedName === null) {
      return { ok: false, code: 'VALIDATION_ERROR' };
    }

    const current = await repository.getById(id);
    if (current === undefined) {
      return { ok: false, code: 'PRODUCT_NOT_FOUND' };
    }

    const duplicate = await repository.findByNormalizedName(normalizedName);
    if (duplicate !== undefined && duplicate.id !== id) {
      return { ok: false, code: 'DUPLICATE_PRODUCT_NAME' };
    }

    const record: ProductRecord = {
      ...current,
      categoryId: input.categoryId,
      isArchived: input.isArchived,
      name,
      normalizedName,
      note: input.note,
      supplierId: input.supplierId,
      updatedAt: now(),
    };

    try {
      await repository.put(record);
      return { ok: true, record };
    } catch {
      return { ok: false, code: 'DB_WRITE_FAILED' };
    }
  }
}
