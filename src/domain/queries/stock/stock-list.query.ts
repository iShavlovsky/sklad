import type { SortDirection } from '@/shared/utils/query';
import type { SubjectKind } from '@/domain/common/record-kinds';

export interface StockListFilters {
  search: string;

  supplierId: string | null;
  productId: string | null;
  categoryId: string | null;

  subjectKind: SubjectKind | null;

  inStockOnly: boolean;
}

export interface StockListSort {
  field:
    | 'title'
    | 'supplierName'
    | 'productName'
    | 'categoryName'
    | 'balance'
    | 'updatedAt';
  direction: SortDirection;
}

export interface StockListQuery {
  filters: StockListFilters;
  sort: StockListSort;
  limit: number | null;
  offset: number;
}
