import { useLiveQuery } from 'dexie-react-hooks';

import type { ProductRecord } from '@/domain/directories/product.record.ts';
import type { ProductListQuery } from '@/domain/queries/directory/product-list.query.ts';
import { appDb } from '@/infrastructure/db';
import { ProductQueries } from '@/infrastructure/queries/directories/product.queries.ts';
import { ProductRepository } from '@/infrastructure/repositories/directories/product.repository.ts';

const productRepository = new ProductRepository(appDb.products);
const productQueries = new ProductQueries(productRepository);

/**
 * Live query hook for the product directory list.
 */
export function useProductList(query: ProductListQuery): ProductRecord[] {
  return useLiveQuery(() => productQueries.list(query), [query]) ?? [];
}
