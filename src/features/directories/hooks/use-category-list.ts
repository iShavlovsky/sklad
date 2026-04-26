import { useLiveQuery } from 'dexie-react-hooks';

import type { CategoryRecord } from '@/domain/directories/category.record.ts';
import type { CategoryListQuery } from '@/domain/queries/directory/category-list.query.ts';
import { appDb } from '@/infrastructure/db';
import { CategoryQueries } from '@/infrastructure/queries/directories/category.queries.ts';
import { CategoryRepository } from '@/infrastructure/repositories/directories/category.repository.ts';

const categoryRepository = new CategoryRepository(appDb.categories);
const categoryQueries = new CategoryQueries(categoryRepository);

/**
 * Live query hook for the category directory list.
 */
export function useCategoryList(query: CategoryListQuery): CategoryRecord[] {
  return useLiveQuery(() => categoryQueries.list(query), [query]) ?? [];
}
