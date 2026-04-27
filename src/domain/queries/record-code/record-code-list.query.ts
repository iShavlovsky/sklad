import type {
  RecordCodeKind,
  RecordCodeOwnerKind,
} from '@/domain/common/record-kinds';
import type { SortDirection } from '@/shared/utils/query';

export interface RecordCodeListFilters {
  search: string;
  ownerKind: RecordCodeOwnerKind | null;
  ownerId: string | null;
  kind: RecordCodeKind | null;
}

export interface RecordCodeListSort {
  field: 'value' | 'createdAt';
  direction: SortDirection;
}

export interface RecordCodeListQuery {
  filters: RecordCodeListFilters;
  sort: RecordCodeListSort;
  limit: number | null;
  offset: number;
}
