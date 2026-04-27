import type {
  RecordOriginKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';
import type { DateRange } from '@/domain/common/value-objects.ts';
import type { SortDirection } from '@/shared/utils/query';

/**
 * Filter contract for the arrival list read model.
 *
 * UI hooks should pass this to the arrival query layer rather than assemble
 * database-specific predicates directly.
 */
export interface ArrivalListFilters {
  search: string;
  subjectKind: SubjectKind | null;

  supplierId: string | null;
  productId: string | null;
  categoryId: string | null;

  hasCodes: boolean | null;

  occurredAt: DateRange;
  createdAt: DateRange;

  originKind: RecordOriginKind | null;
}

/**
 * Sort contract for the arrival list read model.
 */
export interface ArrivalListSort {
  field:
    | 'occurredAt'
    | 'createdAt'
    | 'updatedAt'
    | 'title'
    | 'supplierName'
    | 'productName'
    | 'categoryName'
    | 'amount';
  direction: SortDirection;
}

/**
 * Public query contract for paged arrival list reads in first data.
 */
export interface ArrivalListQuery {
  filters: ArrivalListFilters;
  sort: ArrivalListSort;
  limit: number | null;
  offset: number;
}
