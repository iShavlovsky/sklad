import type {
  DepartureMode,
  RecordOriginKind,
  SubjectKind,
} from '@/domain/common/record-kinds.ts';
import type { DateRange } from '@/domain/common/value-objects.ts';
import type { SortDirection } from '@/shared/utils/query';

export interface DepartureListFilters {
  search: string;
  subjectKind: SubjectKind | null;

  supplierId: string | null;
  productId: string | null;
  categoryId: string | null;

  hasCodes: boolean | null;

  occurredAt: DateRange;
  createdAt: DateRange;

  originKind: RecordOriginKind | null;

  mode: DepartureMode | null;
  basedOnArrivalId: string | null;
}

export interface DepartureListSort {
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

export interface DepartureListQuery {
  filters: DepartureListFilters;
  sort: DepartureListSort;
  limit: number | null;
  offset: number;
}
