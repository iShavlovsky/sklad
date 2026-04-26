import type { SortDirection } from '@/domain/common/query-helpers';

export interface ProductListFilters {
  search: string;
  isArchived: boolean | null;

  supplierId: string | null;
  categoryId: string | null;
}

export interface ProductListSort {
  field: 'name' | 'createdAt' | 'updatedAt';
  direction: SortDirection;
}

export interface ProductListQuery {
  filters: ProductListFilters;
  sort: ProductListSort;
  limit: number | null;
  offset: number;
}
