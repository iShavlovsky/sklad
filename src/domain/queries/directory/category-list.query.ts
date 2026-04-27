import type { SortDirection } from '@/shared/utils/query';

export interface CategoryListFilters {
  search: string;
  isArchived: boolean | null;
}

export interface CategoryListSort {
  field: 'name' | 'createdAt' | 'updatedAt';
  direction: SortDirection;
}

export interface CategoryListQuery {
  filters: CategoryListFilters;
  sort: CategoryListSort;
  limit: number | null;
  offset: number;
}
