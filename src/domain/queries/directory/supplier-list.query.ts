import type { SortDirection } from '@/shared/utils/query';

export interface SupplierListFilters {
  search: string;
  isArchived: boolean | null;
}

export interface SupplierListSort {
  field: 'name' | 'createdAt' | 'updatedAt';
  direction: SortDirection;
}

export interface SupplierListQuery {
  filters: SupplierListFilters;
  sort: SupplierListSort;
  limit: number | null;
  offset: number;
}
