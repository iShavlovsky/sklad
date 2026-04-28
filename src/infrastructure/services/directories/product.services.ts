import type { UpdateProductInput } from '@/domain/directories';
import { UpdateProductService } from '@/domain/directories';
import type { UpdateProductResult } from '@/domain/directories/update-product.result.ts';
import { appDb } from '@/infrastructure/db';
import { ProductRepository } from '@/infrastructure/repositories/directories/product.repository.ts';
import { nowIso } from '@/shared/utils/time.ts';

const productRepository = new ProductRepository(appDb.products);
const updateProductServiceImpl = new UpdateProductService();

export const updateProductService = {
  execute(input: UpdateProductInput): Promise<UpdateProductResult> {
    return updateProductServiceImpl.execute(input, productRepository, nowIso);
  },
};
